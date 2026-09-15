import Anthropic from '@anthropic-ai/sdk'
import { Injectable, Logger } from '@nestjs/common'
import { AssistantConfig } from './assistant.config'

/**
 * Three outcomes and no exception, as `WebPushClient` has: the caller answers a
 * repli for each of them, and a gateway that throws would turn a degraded
 * search into a 500 on a route a visitor is waiting on.
 */
export type ExtractionOutcome =
	| { status: 'extracted'; text: string }
	| { status: 'unconfigured' }
	| { status: 'failed' }

/** Seven small fields of JSON; nothing here needs room to reason. */
const MAX_TOKENS = 256

/**
 * A visitor is waiting on this call, and the repli costs nothing — so a slow
 * gateway must give up rather than hold the request. The SDK's own default is
 * ten minutes, which would hand the browser a timeout instead of the filters.
 */
const TIMEOUT_MS = 8_000

@Injectable()
export class ClaudeClient {
	private readonly logger = new Logger(ClaudeClient.name)
	private readonly client: Anthropic | null

	constructor(private readonly config: AssistantConfig) {
		const settings = config.settings

		this.client = settings
			? new Anthropic({
					apiKey: settings.apiKey,
					timeout: TIMEOUT_MS,
					// One, not the default two: a retry doubles a wait the visitor
					// is already sitting through, and the repli is right there.
					maxRetries: 1,
				})
			: null
	}

	async extract(system: string, phrase: string): Promise<ExtractionOutcome> {
		const settings = this.config.settings

		if (!this.client || !settings) return { status: 'unconfigured' }

		try {
			const response = await this.client.messages.create({
				model: settings.model,
				max_tokens: MAX_TOKENS,
				system,
				// The one part of the request a caller controls. It cannot reach
				// anything but the filter set: whatever a phrase talks the model
				// into answering is narrowed against the contract before it is
				// used, so the worst an injected instruction buys is a filter the
				// visitor could have picked from the form themselves.
				messages: [{ role: 'user', content: phrase }],
			})

			const text = response.content
				.filter(block => block.type === 'text')
				.map(block => block.text)
				.join('')

			return text ? { status: 'extracted', text } : { status: 'failed' }
		} catch (error) {
			// Never the phrase: someone wrote what they lost into it.
			this.logger.error(`Assistant extraction failed: ${String(error)}`)

			return { status: 'failed' }
		}
	}
}
