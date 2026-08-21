import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

export interface LetextoSettings {
	apiUrl: string
	apiKey: string
	sender: string
}

/**
 * Reads the Letexto credentials once. In production an incomplete set is fatal —
 * an API that silently cannot send an OTP locks every phone-number sign-in,
 * which is worse than refusing to start. Elsewhere it resolves to `null` and the
 * code is logged instead, so local development needs no SMS credit.
 */
@Injectable()
export class LetextoConfig {
	readonly settings: LetextoSettings | null

	constructor(private readonly config: ConfigService) {
		this.settings = this.read()
	}

	get isConfigured(): boolean {
		return this.settings !== null
	}

	private read(): LetextoSettings | null {
		const apiUrl = this.config.get<string>('LETEXTO_API_URL')?.trim()
		const apiKey = this.config.get<string>('LETEXTO_API_KEY')?.trim()
		const sender = this.config.get<string>('LETEXTO_API_SENDER')?.trim()

		if (apiUrl && apiKey && sender) return { apiUrl, apiKey, sender }

		const missing = [
			!apiUrl && 'LETEXTO_API_URL',
			!apiKey && 'LETEXTO_API_KEY',
			!sender && 'LETEXTO_API_SENDER',
		].filter(Boolean)

		if (this.config.get<string>('NODE_ENV') === 'production') {
			throw new Error(
				`SMS delivery is not configured: missing ${missing.join(', ')}`,
			)
		}

		return null
	}
}
