import type { Queue } from 'bullmq'
import { describe, expect, it, vi } from 'vitest'
import { OTP_ATTEMPTS, OTP_BACKOFF_DELAY_MS } from '@/shared/auth/otp.const'
import { SEND_OTP_JOB } from '@/infrastructures/queue/queue.constants'
import { OtpDispatcher, type SendOtpJobData } from '../otp-dispatcher.service'

function buildDispatcher(add = vi.fn().mockResolvedValue(undefined)) {
	const dispatcher = new OtpDispatcher({
		add,
	} as unknown as Queue<SendOtpJobData>)
	return { dispatcher, add }
}

const JOB: SendOtpJobData = {
	purpose: 'sign-in',
	phoneNumber: '+2250585743342',
	code: '123456',
}

describe('OtpDispatcher', () => {
	it('queues the send under the documented job name', async () => {
		const { dispatcher, add } = buildDispatcher()

		await dispatcher.dispatch(JOB)

		expect(add).toHaveBeenCalledTimes(1)
		const [name, data] = add.mock.calls[0] as [string, SendOtpJobData]
		expect(name).toBe(SEND_OTP_JOB)
		expect(data).toEqual(JOB)
	})

	it('retries with an exponential backoff', async () => {
		const { dispatcher, add } = buildDispatcher()

		await dispatcher.dispatch(JOB)

		const [, , options] = add.mock.calls[0] as [
			string,
			SendOtpJobData,
			{ attempts: number; backoff: { type: string; delay: number } },
		]
		expect(options.attempts).toBe(OTP_ATTEMPTS)
		expect(options.backoff).toEqual({
			type: 'exponential',
			delay: OTP_BACKOFF_DELAY_MS,
		})
	})

	// A queued job holds a live code, so none is kept once it settles.
	it('keeps neither completed nor failed jobs in Redis', async () => {
		const { dispatcher, add } = buildDispatcher()

		await dispatcher.dispatch(JOB)

		expect(add.mock.calls[0]?.[2]).toMatchObject({
			removeOnComplete: true,
			removeOnFail: true,
		})
	})

	// better-auth awaits `sendOTP`, so this surfaces as a failed request rather
	// than a silent no-SMS.
	it('propagates a failure to enqueue', async () => {
		const { dispatcher } = buildDispatcher(
			vi.fn().mockRejectedValue(new Error('redis down')),
		)

		await expect(dispatcher.dispatch(JOB)).rejects.toThrow('redis down')
	})
})
