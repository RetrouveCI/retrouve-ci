import { Injectable, Logger } from '@nestjs/common'
import webpush from 'web-push'
import { PushConfig } from './push.config'

export interface PushTarget {
	endpoint: string
	p256dh: string
	auth: string
}

export interface PushPayload {
	title: string
	message: string
	link?: string
}

/**
 * Three outcomes and no exception, because the caller is a side effect of a row
 * that already exists. `gone` is the one that matters: a push service answers
 * 404 or 410 for a subscription the browser dropped, and a row kept then would
 * inflate the very count A3 is decided on.
 */
export type PushOutcome = 'sent' | 'gone' | 'failed' | 'unconfigured'

const GONE_STATUSES = [404, 410]

@Injectable()
export class WebPushClient {
	private readonly logger = new Logger(WebPushClient.name)

	constructor(private readonly config: PushConfig) {}

	async send(target: PushTarget, payload: PushPayload): Promise<PushOutcome> {
		const settings = this.config.settings

		if (!settings) return 'unconfigured'

		try {
			await webpush.sendNotification(
				{
					endpoint: target.endpoint,
					keys: { p256dh: target.p256dh, auth: target.auth },
				},
				JSON.stringify(payload),
				{
					vapidDetails: {
						subject: settings.subject,
						publicKey: settings.publicKey,
						privateKey: settings.privateKey,
					},
				},
			)

			return 'sent'
		} catch (error) {
			const status = (error as { statusCode?: number }).statusCode

			if (status && GONE_STATUSES.includes(status)) return 'gone'

			// The endpoint, never the payload: it names an object someone lost.
			this.logger.error(`Push to ${target.endpoint} failed: ${String(error)}`)

			return 'failed'
		}
	}
}
