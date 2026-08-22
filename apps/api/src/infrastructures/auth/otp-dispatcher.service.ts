import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import type { Queue } from 'bullmq'
import type { OtpPurpose } from '@/shared/auth/otp-message'
import { OTP_ATTEMPTS, OTP_BACKOFF_DELAY_MS } from '@/shared/auth/otp.const'
import {
	OTP_QUEUE,
	SEND_OTP_JOB,
} from '@/infrastructures/queue/queue.constants'

export interface SendOtpJobData {
	purpose: OtpPurpose
	phoneNumber: string
	code: string
}

@Injectable()
export class OtpDispatcher {
	constructor(
		@InjectQueue(OTP_QUEUE) private readonly queue: Queue<SendOtpJobData>,
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
		await this.queue.add(SEND_OTP_JOB, data, {
			attempts: OTP_ATTEMPTS,
			backoff: { type: 'exponential', delay: OTP_BACKOFF_DELAY_MS },
			removeOnComplete: true,
			removeOnFail: true,
		})
	}
}
