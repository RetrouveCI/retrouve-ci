import { Injectable, Logger } from '@nestjs/common'
import { LetextoConfig } from './letexto.config'
import { InvalidRecipientError, SmsDeliveryError } from './sms.errors'

const COUNTRY_CODE = '225'
const LOCAL_NUMBER_LENGTH = 10

export interface SendSmsInput {
	to: string
	content: string
}

export function toLetextoRecipient(phoneNumber: string): string {
	const digits = phoneNumber.replace(/\D/g, '')
	const local = digits.startsWith(COUNTRY_CODE)
		? digits.slice(COUNTRY_CODE.length)
		: digits

	if (local.length !== LOCAL_NUMBER_LENGTH) {
		throw new InvalidRecipientError(phoneNumber)
	}

	return `${COUNTRY_CODE}${local}`
}

@Injectable()
export class LetextoService {
	private readonly logger = new Logger(LetextoService.name)

	constructor(private readonly config: LetextoConfig) {}

	get isConfigured(): boolean {
		return this.config.isConfigured
	}

	async send({ to, content }: SendSmsInput): Promise<void> {
		const settings = this.config.settings

		if (!settings) {
			this.logger.warn(`SMS not sent to ${to}: Letexto is not configured`)
			return
		}

		let response: Response

		try {
			response = await fetch(settings.apiUrl, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${settings.apiKey}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					from: settings.sender,
					to: toLetextoRecipient(to),
					content,
				}),
			})
		} catch (error) {
			throw new SmsDeliveryError(
				`Letexto is unreachable: ${error instanceof Error ? error.message : String(error)}`,
			)
		}

		if (!response.ok) {
			const body = await response.text().catch(() => '')

			throw new SmsDeliveryError(
				`Letexto refused the message (${response.status})${body ? `: ${body}` : ''}`,
				response.status,
			)
		}
	}
}
