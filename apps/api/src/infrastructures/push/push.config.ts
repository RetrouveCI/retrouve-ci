import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

export interface VapidSettings {
	publicKey: string
	privateKey: string
	subject: string
}

/**
 * ⚠️ Unlike `LetextoConfig`, an incomplete set is **never fatal**, in production
 * included: push is opt-in, and an API refusing to boot over a feature nobody
 * has enabled would trade a silence for an outage. Unset, nothing is sent and
 * the client offers no switch either.
 */
@Injectable()
export class PushConfig {
	readonly settings: VapidSettings | null

	constructor(private readonly config: ConfigService) {
		this.settings = this.read()
	}

	get isConfigured(): boolean {
		return this.settings !== null
	}

	private read(): VapidSettings | null {
		const publicKey = this.config.get<string>('VAPID_PUBLIC_KEY')?.trim()
		const privateKey = this.config.get<string>('VAPID_PRIVATE_KEY')?.trim()
		// `mailto:` or an https URL, which is what RFC 8292 asks a sender to
		// identify itself by; the push service uses it to report a problem.
		const subject = this.config.get<string>('VAPID_SUBJECT')?.trim()

		if (publicKey && privateKey && subject) {
			return { publicKey, privateKey, subject }
		}

		return null
	}
}
