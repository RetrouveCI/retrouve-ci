import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ConfigService } from '@nestjs/config'
import { PushConfig } from '../push.config'
import { WebPushClient } from '../web-push.client'

const { sendNotification } = vi.hoisted(() => ({ sendNotification: vi.fn() }))

vi.mock('web-push', () => ({ default: { sendNotification } }))

const TARGET = {
	endpoint: 'https://fcm.googleapis.com/fcm/send/abc',
	p256dh: 'a'.repeat(87),
	auth: 'b'.repeat(22),
}

const PAYLOAD = { title: 'Titre', message: 'Message', link: '/posts/abc' }

const VAPID = {
	VAPID_PUBLIC_KEY: 'pub',
	VAPID_PRIVATE_KEY: 'priv',
	VAPID_SUBJECT: 'mailto:contact@retrouve.ci',
}

function configWith(values: Record<string, string | undefined>): PushConfig {
	return new PushConfig({
		get: (name: string) => values[name],
	} as unknown as ConfigService)
}

const clientWith = (values: Record<string, string | undefined>) =>
	new WebPushClient(configWith(values))

beforeEach(() => {
	sendNotification.mockReset().mockResolvedValue(undefined)
})

describe('the VAPID configuration', () => {
	it('resolves when the three are set', () => {
		expect(configWith(VAPID).isConfigured).toBe(true)
	})

	it.each(Object.keys(VAPID))('is unconfigured without %s', missing => {
		expect(configWith({ ...VAPID, [missing]: undefined }).isConfigured).toBe(
			false,
		)
	})

	/**
	 * ⚠️ Unlike `LetextoConfig`, which is fatal in production: push is opt-in, so
	 * an API refusing to boot over it would trade a silence for an outage.
	 */
	it('never throws in production, incomplete included', () => {
		expect(() => configWith({ NODE_ENV: 'production' })).not.toThrow()
	})
})

describe('sending a push', () => {
	it('answers unconfigured and sends nothing without VAPID', async () => {
		expect(await clientWith({}).send(TARGET, PAYLOAD)).toBe('unconfigured')
		expect(sendNotification).not.toHaveBeenCalled()
	})

	it('hands the transport the keys and the signed details', async () => {
		expect(await clientWith(VAPID).send(TARGET, PAYLOAD)).toBe('sent')
		expect(sendNotification).toHaveBeenCalledWith(
			{
				endpoint: TARGET.endpoint,
				keys: { p256dh: TARGET.p256dh, auth: TARGET.auth },
			},
			JSON.stringify(PAYLOAD),
			{
				vapidDetails: {
					subject: VAPID.VAPID_SUBJECT,
					publicKey: VAPID.VAPID_PUBLIC_KEY,
					privateKey: VAPID.VAPID_PRIVATE_KEY,
				},
			},
		)
	})

	// The two the push services answer for a subscription the browser dropped.
	it.each([404, 410])('reports %i as gone', async statusCode => {
		sendNotification.mockRejectedValue({ statusCode })

		expect(await clientWith(VAPID).send(TARGET, PAYLOAD)).toBe('gone')
	})

	it.each([400, 429, 500])(
		'reports %i as failed, not gone',
		async statusCode => {
			sendNotification.mockRejectedValue({ statusCode })

			expect(await clientWith(VAPID).send(TARGET, PAYLOAD)).toBe('failed')
		},
	)

	// It is a side effect of a row that already exists, so it never throws.
	it('reports a failure with no status rather than throwing', async () => {
		sendNotification.mockRejectedValue(new Error('socket hang up'))

		expect(await clientWith(VAPID).send(TARGET, PAYLOAD)).toBe('failed')
	})
})
