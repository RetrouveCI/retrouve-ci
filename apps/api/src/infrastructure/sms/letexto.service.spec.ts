import type { ConfigService } from '@nestjs/config'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LetextoConfig } from './letexto.config'
import { LetextoService, toLetextoRecipient } from './letexto.service'
import { InvalidRecipientError, SmsDeliveryError } from './sms.errors'

const SETTINGS: Record<string, string> = {
	LETEXTO_API_URL: 'https://apis.letexto.com/v1/messages/send',
	LETEXTO_API_KEY: 'test-key',
	LETEXTO_API_SENDER: 'Retrouveci',
	NODE_ENV: 'test',
}

function buildConfig(overrides: Record<string, string | undefined> = {}) {
	const values = { ...SETTINGS, ...overrides }
	return new LetextoConfig({
		get: (key: string) => values[key],
	} as unknown as ConfigService)
}

const okResponse = () => new Response('{}', { status: 200 })

let fetchMock: ReturnType<typeof vi.fn>

beforeEach(() => {
	fetchMock = vi.fn().mockResolvedValue(okResponse())
	vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
	vi.unstubAllGlobals()
	vi.restoreAllMocks()
})

describe('toLetextoRecipient', () => {
	// Letexto wants `225` plus exactly the 10 local digits.
	it.each([
		['E.164 as better-auth stores it', '+2250585743342'],
		['E.164 with the spacing the form shows', '+225 05 85 74 33 42'],
		['no plus', '2250585743342'],
		['the local number alone', '0585743342'],
		['the local number spaced', '05 85 74 33 42'],
	])('accepts %s', (_label, input) => {
		expect(toLetextoRecipient(input)).toBe('2250585743342')
	})

	// Sending a malformed recipient would be billed and silently lost, so it is
	// refused here instead.
	it.each([
		['too short', '+22505857433'],
		['too long', '+22505857433421'],
		['empty', ''],
		['letters only', 'pas-un-numero'],
		['a country code with nothing after it', '225'],
	])('refuses %s', (_label, input) => {
		expect(() => toLetextoRecipient(input)).toThrow(InvalidRecipientError)
	})
})

describe('LetextoService', () => {
	it('posts the documented payload with a bearer token', async () => {
		await new LetextoService(buildConfig()).send({
			to: '+2250585743342',
			content: 'Votre code est 123456.',
		})

		expect(fetchMock).toHaveBeenCalledTimes(1)
		const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]

		expect(url).toBe(SETTINGS.LETEXTO_API_URL)
		expect(init.method).toBe('POST')
		expect(init.headers).toMatchObject({
			Authorization: 'Bearer test-key',
			'Content-Type': 'application/json',
		})
		expect(JSON.parse(String(init.body))).toEqual({
			from: 'Retrouveci',
			to: '2250585743342',
			content: 'Votre code est 123456.',
		})
	})

	it('turns a refusal into an SmsDeliveryError carrying the status', async () => {
		fetchMock.mockResolvedValue(new Response('quota exceeded', { status: 402 }))

		const send = new LetextoService(buildConfig()).send({
			to: '+2250585743342',
			content: 'x',
		})

		await expect(send).rejects.toBeInstanceOf(SmsDeliveryError)
		await expect(send).rejects.toMatchObject({ status: 402 })
	})

	it('turns an unreachable gateway into an SmsDeliveryError', async () => {
		fetchMock.mockRejectedValue(new TypeError('fetch failed'))

		await expect(
			new LetextoService(buildConfig()).send({ to: '+225', content: 'x' }),
		).rejects.toBeInstanceOf(SmsDeliveryError)
	})

	// Local development has no credentials, and must not have its sign-in broken
	// by that. The consumer logs the code instead; nothing is posted.
	it('sends nothing and reports itself unconfigured without credentials', async () => {
		const service = new LetextoService(
			buildConfig({ LETEXTO_API_KEY: undefined }),
		)

		expect(service.isConfigured).toBe(false)
		await service.send({ to: '+2250585743342', content: 'x' })
		expect(fetchMock).not.toHaveBeenCalled()
	})
})

describe('LetextoConfig', () => {
	it('resolves the three settings when all are present', () => {
		expect(buildConfig().settings).toEqual({
			apiUrl: SETTINGS.LETEXTO_API_URL,
			apiKey: 'test-key',
			sender: 'Retrouveci',
		})
	})

	it('treats blanks as missing', () => {
		expect(buildConfig({ LETEXTO_API_SENDER: '   ' }).isConfigured).toBe(false)
	})

	it.each(['LETEXTO_API_URL', 'LETEXTO_API_KEY', 'LETEXTO_API_SENDER'])(
		'refuses to start in production without %s',
		key => {
			expect(() =>
				buildConfig({ NODE_ENV: 'production', [key]: undefined }),
			).toThrow(new RegExp(key))
		},
	)
})
