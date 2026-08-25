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

	it('trims a padded address', () => {
		const config = buildConfig({ REDIS_URL: '  redis://cache.internal:6379  ' })

		expect(buildQueueConnection(config).connection.url).toBe(
			'redis://cache.internal:6379',
		)
	})

	it('falls back to localhost outside production', () => {
		expect(buildQueueConnection(buildConfig()).connection.url).toBe(
			'redis://localhost:6379',
		)
	})

	// BullMQ's own fallback is silent: the API boots healthy and every OTP job
	// waits in a queue no worker reads.
	it('refuses to start in production without an address', () => {
		const config = buildConfig({ NODE_ENV: 'production' })

		expect(() => buildQueueConnection(config)).toThrow(/REDIS_URL/)
	})

	it('accepts a configured address in production', () => {
		const config = buildConfig({
			NODE_ENV: 'production',
			REDIS_URL: 'redis://cache.internal:6379',
		})

		expect(buildQueueConnection(config).connection.url).toBe(
			'redis://cache.internal:6379',
		)
	})

	it('treats a blank address as unset', () => {
		const config = buildConfig({ NODE_ENV: 'production', REDIS_URL: '   ' })

		expect(() => buildQueueConnection(config)).toThrow(/REDIS_URL/)
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
