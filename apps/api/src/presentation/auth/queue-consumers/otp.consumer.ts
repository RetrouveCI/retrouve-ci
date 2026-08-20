import { logSecretDelivery } from '@app/auth'
import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import type { Job } from 'bullmq'
import type { SendOtpJobData } from '@/infrastructure/auth/otp-dispatcher.service'
import { LetextoService } from '@/infrastructure/sms/letexto.service'
import { buildOtpMessage } from '@/shared/auth/otp-message'
import { OTP_ATTEMPTS, OTP_QUEUE } from '@/shared/auth/otp.const'

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

		// Without credentials — local development — the code goes to the console,
		// exactly as it did before there was a gateway.
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
			// Never the code: a log is not a place for a live secret.
			this.logger.error(
				`${LOG_LABELS[purpose]} to ${phoneNumber} failed on attempt ${job.attemptsMade + 1}/${OTP_ATTEMPTS}: ${
					error instanceof Error ? error.message : String(error)
				}`,
			)
			throw error
		}
	}
}
