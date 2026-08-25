import type { ConfigService } from '@nestjs/config'
import { describe, expect, it, vi } from 'vitest'
import {
	FIND_MATCHES_JOB,
	MATCHING_QUEUE,
	OTP_QUEUE,
	SEND_OTP_JOB,
} from '../queue.constants'
import { buildQueueConnection } from '../queue.config'

function buildConfig(values: Record<string, string> = {}) {
	return {
		get: vi.fn((key: string) => values[key]),
	} as unknown as ConfigService
}

describe('buildQueueConnection', () => {
	it('points BullMQ at the configured Redis instance', () => {
		const config = buildConfig({ REDIS_URL: 'redis://cache.internal:6379' })

		expect(buildQueueConnection(config)).toEqual({
			connection: { url: 'redis://cache.internal:6379' },
		})
	})

	it('reads the address from REDIS_URL alone', () => {
		const config = buildConfig({ REDIS_URL: 'redis://localhost:6379' })

		buildQueueConnection(config)

		expect(config.get).toHaveBeenCalledExactlyOnceWith('REDIS_URL')
	})
})

describe('queue names', () => {
	// Two queues sharing a name would put OTP jobs in front of the matching
	// consumer, which reads them as malformed and drops them.
	it('address distinct Redis keys', () => {
		expect(new Set([OTP_QUEUE, MATCHING_QUEUE]).size).toBe(2)
		expect(new Set([SEND_OTP_JOB, FIND_MATCHES_JOB]).size).toBe(2)
	})
})
