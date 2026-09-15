import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

/**
 * Haiku, because the task is an extraction and not a judgement: a sentence in,
 * a handful of known filters out. The model never sees a listing.
 */
export const ASSISTANT_MODEL = 'claude-haiku-4-5'

export interface AssistantSettings {
	apiKey: string
	model: string
}

/**
 * Like `PushConfig` and unlike `LetextoConfig`, an unset key is **never fatal**,
 * production included: the assistant is an addition to a search that works
 * without it, so refusing to boot over it would trade a repli for an outage.
 */
@Injectable()
export class AssistantConfig {
	readonly settings: AssistantSettings | null

	constructor(private readonly config: ConfigService) {
		this.settings = this.read()
	}

	get isConfigured(): boolean {
		return this.settings !== null
	}

	private read(): AssistantSettings | null {
		const apiKey = this.config.get<string>('ANTHROPIC_API_KEY')?.trim()

		if (!apiKey) return null

		const model =
			this.config.get<string>('ASSISTANT_MODEL')?.trim() || ASSISTANT_MODEL

		return { apiKey, model }
	}
}
