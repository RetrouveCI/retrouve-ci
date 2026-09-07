import { InjectQueue } from '@nestjs/bullmq'
import { Inject, Injectable, Logger, Optional } from '@nestjs/common'
import type { Queue } from 'bullmq'
import { toLocalDigits } from '@app/contracts/shared'
import type { OtpPurpose } from '@/shared/auth/otp-message'
import { OTP_ATTEMPTS, OTP_BACKOFF_DELAY_MS } from '@/shared/auth/otp.const'
import { OTP_PER_NUMBER } from '@/shared/rate-limit/rate-limit.policy'
import type { RateLimitCounter } from '@/shared/rate-limit/rate-limit.store'
import {
	OTP_QUEUE,
	SEND_OTP_JOB,
} from '@/infrastructures/queue/queue.constants'
import { OTP_BUDGET_COUNTER } from './auth.tokens'
import { OtpBudgetExceededError } from './otp-budget.error'

export interface SendOtpJobData {
	purpose: OtpPurpose
	phoneNumber: string
	code: string
}

@Injectable()
export class OtpDispatcher {
	private readonly logger = new Logger(OtpDispatcher.name)

	constructor(
		@InjectQueue(OTP_QUEUE) private readonly queue: Queue<SendOtpJobData>,
		@Optional()
		@Inject(OTP_BUDGET_COUNTER)
		private readonly counter?: RateLimitCounter,
	) {}

	/**
	 * better-auth awaits this, so a failure to enqueue fails the `send-otp`
	 * request — which is the honest outcome: the caller is told to retry rather
	 * than left waiting for an SMS that was never queued.
	 *
	 * Jobs carry a live OTP, so neither the completed nor the failed ones are
	 * kept in Redis; the consumer logs failures without the code.
	 */
	async dispatch(data: SendOtpJobData): Promise<void> {
		await this.requireBudget(data.phoneNumber)

		await this.queue.add(SEND_OTP_JOB, data, {
			attempts: OTP_ATTEMPTS,
			backoff: { type: 'exponential', delay: OTP_BACKOFF_DELAY_MS },
			removeOnComplete: true,
			removeOnFail: true,
		})
	}

	// The one choke point both OTP callbacks go through. better-auth has already
	// stored the code, so a refusal leaves one to expire — cheaper than an SMS.
	private async requireBudget(phoneNumber: string): Promise<void> {
		if (!this.counter) return

		const key = `rl:otp-number:${toLocalDigits(phoneNumber)}`

		let hit
		try {
			hit = await this.counter.hit(key, OTP_PER_NUMBER.windowSeconds)
		} catch (error) {
			// Fail open, loudly, as the request hook does: a counter that cannot
			// reach Redis must not stop every sign-in.
			this.logger.error(`OTP budget store unreachable, allowing: ${error}`)
			return
		}

		if (hit.count > OTP_PER_NUMBER.max) {
			throw new OtpBudgetExceededError()
		}
	}
}
