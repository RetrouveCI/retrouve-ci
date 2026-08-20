import { Injectable, Logger } from '@nestjs/common'
import { LetextoConfig } from './letexto.config'
import { SmsDeliveryError } from './sms.errors'

export interface SendSmsInput {
	/** E.164, with or without the leading `+`. */
	to: string
	content: string
}

/**
 * Letexto expects the recipient in international form **without** the `+`
 * (`2250585743342`), while better-auth stores and receives E.164 (`+225…`).
 */
export function toLetextoRecipient(phoneNumber: string): string {
	return phoneNumber.replace(/[^\d]/g, '')
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
