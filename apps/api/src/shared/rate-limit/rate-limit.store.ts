import Redis from 'ioredis'

export interface RateLimitHit {
	count: number
	ttlSeconds: number
}

export interface RateLimitCounter {
	hit(key: string, windowSeconds: number): Promise<RateLimitHit>
	close(): Promise<void>
}

/**
 * Atomic and one round trip. `INCR` then `EXPIRE` from the client can strand a
 * key with no expiry — a caller locked out for good — and `EXPIRE NX` would say
 * this in one call but needs Redis 7, which production's version is not ours to
 * assume.
 */
const HIT = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
return { count, redis.call('TTL', KEYS[1]) }
`

export function createRedisCounter(url: string): RateLimitCounter {
	const redis = new Redis(url, { maxRetriesPerRequest: 2, lazyConnect: false })

	return {
		async hit(key, windowSeconds) {
			const [count, ttlSeconds] = (await redis.eval(
				HIT,
				1,
				key,
				String(windowSeconds),
			)) as [number, number]

			return { count, ttlSeconds: ttlSeconds > 0 ? ttlSeconds : windowSeconds }
		},
		async close() {
			await redis.quit()
		},
	}
}
