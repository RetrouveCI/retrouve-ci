import type { Queue } from 'bullmq'
import { describe, expect, it, vi } from 'vitest'
import { OTP_ATTEMPTS, OTP_BACKOFF_DELAY_MS } from '@/shared/auth/otp.const'
import { SEND_OTP_JOB } from '@/infrastructures/queue/queue.constants'
import { OTP_PER_NUMBER } from '@/shared/rate-limit/rate-limit.policy'
import type { RateLimitCounter } from '@/shared/rate-limit/rate-limit.store'
import { OtpBudgetExceededError } from '../otp-budget.error'
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

/** R44's second guard: an address is rotatable, an SMS costs money on a number. */
describe('OtpDispatcher — the per-number budget', () => {
	const build = (counter?: RateLimitCounter) => {
		const add = vi.fn().mockResolvedValue(undefined)
		const dispatcher = new OtpDispatcher(
			{ add } as unknown as Queue<SendOtpJobData>,
			counter,
		)
		return { dispatcher, add }
	}

	const counterAt = (count: number): RateLimitCounter => ({
		hit: vi.fn().mockResolvedValue({ count, ttlSeconds: 300 }),
		close: vi.fn(),
	})

	it('counts on the number in local form, however it was stored', async () => {
		const counter = counterAt(1)
		const { dispatcher } = build(counter)

		await dispatcher.dispatch(JOB)

		expect(counter.hit).toHaveBeenCalledWith(
			'rl:otp-number:0585743342',
			OTP_PER_NUMBER.windowSeconds,
		)
	})

	it('queues the send while the number is under its budget', async () => {
		const { dispatcher, add } = build(counterAt(OTP_PER_NUMBER.max))

		await dispatcher.dispatch(JOB)

		expect(add).toHaveBeenCalledTimes(1)
	})

	it('refuses past it, without queueing anything', async () => {
		const { dispatcher, add } = build(counterAt(OTP_PER_NUMBER.max + 1))

		await expect(dispatcher.dispatch(JOB)).rejects.toBeInstanceOf(
			OtpBudgetExceededError,
		)
		expect(add).not.toHaveBeenCalled()
	})

	// Same stance as the request hook: a counter that cannot reach Redis must
	// not stop every sign-in on the platform.
	it('lets the send through when the store is unreachable', async () => {
		const counter: RateLimitCounter = {
			hit: vi.fn().mockRejectedValue(new Error('down')),
			close: vi.fn(),
		}
		const { dispatcher, add } = build(counter)

		await dispatcher.dispatch(JOB)

		expect(add).toHaveBeenCalledTimes(1)
	})

	// `REDIS_URL` unset outside production: the budget is simply not counted.
	it('counts nothing when no counter was provided', async () => {
		const { dispatcher, add } = build(undefined)

		await dispatcher.dispatch(JOB)

		expect(add).toHaveBeenCalledTimes(1)
	})
})
