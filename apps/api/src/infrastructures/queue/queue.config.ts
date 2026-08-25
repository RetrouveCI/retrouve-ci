import type { ConfigService } from '@nestjs/config'

export interface QueueConnection {
	connection: { url: string }
}

const DEFAULT_REDIS_URL = 'redis://localhost:6379'

/**
 * The Redis address every BullMQ queue shares. Extracted from the module so it
 * can be asserted: an inline `useFactory` is only reachable by booting Nest,
 * which would open a real connection.
 *
 * Required in production, like the Letexto credentials and `ALLOWED_ORIGINS`.
 * Left unset, BullMQ falls back to localhost and the API boots perfectly
 * healthy while every OTP SMS and every match notification piles up in a queue
 * no worker will ever read — a failure that only surfaces as users not
 * receiving their sign-in code.
 */
export function buildQueueConnection(config: ConfigService): QueueConnection {
	const url = config.get<string>('REDIS_URL')?.trim()

	if (url) return { connection: { url } }

	if (config.get<string>('NODE_ENV') === 'production') {
		throw new Error(
			'REDIS_URL must point at the Redis instance in production: without it BullMQ falls back to localhost, so OTP and matching jobs are queued where no worker reads them.',
		)
	}

	return { connection: { url: DEFAULT_REDIS_URL } }
}
