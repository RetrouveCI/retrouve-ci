import { type Job, UnrecoverableError } from 'bullmq'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { SendOtpJobData } from '@/infrastructures/auth/otp-dispatcher.service'
import type { LetextoService } from '@/infrastructures/sms/letexto.service'
import {
	InvalidRecipientError,
	SmsDeliveryError,
} from '@/infrastructures/sms/sms.errors'
import { OtpConsumer } from './otp.consumer'

function buildJob(overrides: Partial<SendOtpJobData> = {}, attemptsMade = 0) {
	return {
		data: {
			purpose: 'sign-in',
			phoneNumber: '+2250585743342',
			code: '123456',
			...overrides,
		},
		attemptsMade,
	} as Job<SendOtpJobData>
}

function buildSms(
	isConfigured: boolean,
	send = vi.fn().mockResolvedValue(undefined),
) {
	return { isConfigured, send } as unknown as LetextoService & {
		send: ReturnType<typeof vi.fn>
	}
}

/** The consumer's own Nest logger, so a test can read what it was handed. */
function consumerLogger(consumer: OtpConsumer): { error: (m: string) => void } {
	return (consumer as unknown as { logger: { error: (m: string) => void } })
		.logger
}

beforeEach(() => {
	vi.spyOn(console, 'log').mockImplementation(() => undefined)
	vi.spyOn(console, 'warn').mockImplementation(() => undefined)
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('OtpConsumer', () => {
	it('sends the sign-in message to the job’s number', async () => {
		const sms = buildSms(true)

		await new OtpConsumer(sms).process(buildJob())

		expect(sms.send).toHaveBeenCalledTimes(1)
		const [{ to, content }] = sms.send.mock.calls[0] as [
			{ to: string; content: string },
		]
		expect(to).toBe('+2250585743342')
		expect(content).toContain('123456')
		expect(content).toContain('verification')
	})

	it('sends the reset message for a password-reset job', async () => {
		const sms = buildSms(true)

		await new OtpConsumer(sms).process(buildJob({ purpose: 'password-reset' }))

		const [{ content }] = sms.send.mock.calls[0] as [{ content: string }]
		expect(content).toContain('reinitialisation')
	})

	// Local development: no credentials, no send, and the code still reaches the
	// developer through the console.
	it('logs the code instead of sending when the gateway is unconfigured', async () => {
		const sms = buildSms(false)

		await new OtpConsumer(sms).process(buildJob())

		expect(sms.send).not.toHaveBeenCalled()
	})

	// Rethrowing is what lets BullMQ retry with its backoff.
	it('rethrows a delivery failure so the job is retried', async () => {
		const send = vi.fn().mockRejectedValue(new SmsDeliveryError('down', 503))

		await expect(
			new OtpConsumer(buildSms(true, send)).process(buildJob()),
		).rejects.toBeInstanceOf(SmsDeliveryError)
	})

	// Three retries are for a gateway that might come back; a bad number never
	// will, so BullMQ is told not to bother.
	it('does not retry a recipient the gateway cannot accept', async () => {
		const send = vi
			.fn()
			.mockRejectedValue(new InvalidRecipientError('+22505857433'))
		const consumer = new OtpConsumer(buildSms(true, send))
		vi.spyOn(consumerLogger(consumer), 'error').mockImplementation(
			() => undefined,
		)

		await expect(consumer.process(buildJob())).rejects.toBeInstanceOf(
			UnrecoverableError,
		)
	})

	it('never writes the code into the failure log', async () => {
		const send = vi.fn().mockRejectedValue(new SmsDeliveryError('down', 503))
		const consumer = new OtpConsumer(buildSms(true, send))

		const logged: string[] = []
		vi.spyOn(consumerLogger(consumer), 'error').mockImplementation(message => {
			logged.push(String(message))
		})

		await expect(consumer.process(buildJob())).rejects.toThrow()

		expect(logged).toHaveLength(1)
		expect(logged[0]).toContain('+2250585743342')
		expect(logged[0]).not.toContain('123456')
	})
})
