import { logSecretDelivery } from '@app/auth'
import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { type Job, UnrecoverableError } from 'bullmq'
import type { SendOtpJobData } from '@/infrastructures/auth/otp-dispatcher.service'
import { LetextoService } from '@/infrastructures/sms/letexto.service'
import { InvalidRecipientError } from '@/infrastructures/sms/sms.errors'
import { buildOtpMessage } from '@/shared/auth/otp-message'
import { OTP_ATTEMPTS } from '@/shared/auth/otp.const'
import { OTP_QUEUE } from '@/infrastructures/queue/queue.constants'

const LOG_LABELS: Record<SendOtpJobData['purpose'], string> = {
	'sign-in': 'OTP',
	'password-reset': 'Password reset OTP',
}

@Processor(OTP_QUEUE)
export class OtpConsumer extends WorkerHost {
	private readonly logger = new Logger(OtpConsumer.name)

	constructor(private readonly sms: LetextoService) {
		super()
	}

	async process(job: Job<SendOtpJobData>): Promise<void> {
		const { purpose, phoneNumber, code } = job.data

		if (!this.sms.isConfigured) {
			logSecretDelivery(LOG_LABELS[purpose], phoneNumber, code)
			return
		}

		try {
			await this.sms.send({
				to: phoneNumber,
				content: buildOtpMessage(purpose, code),
			})
		} catch (error) {
			this.logger.error(
				`${LOG_LABELS[purpose]} to ${phoneNumber} failed on attempt ${job.attemptsMade + 1}/${OTP_ATTEMPTS}: ${
					error instanceof Error ? error.message : String(error)
				}`,
			)

			// A malformed number will not become valid, so it must not burn the
			// retries a transient gateway failure needs.
			if (error instanceof InvalidRecipientError) {
				throw new UnrecoverableError(error.message)
			}

			throw error
		}
	}
}
