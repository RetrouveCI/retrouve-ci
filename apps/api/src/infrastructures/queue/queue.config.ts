import type { ConfigService } from '@nestjs/config'

export interface QueueConnection {
	connection: { url: string | undefined }
}

/**
 * The Redis address every BullMQ queue shares. Extracted from the module so it
 * can be asserted: an inline `useFactory` is only reachable by booting Nest,
 * which would open a real connection.
 */
export function buildQueueConnection(config: ConfigService): QueueConnection {
	return { connection: { url: config.get<string>('REDIS_URL') } }
}
