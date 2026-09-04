import { limitFor } from './rate-limit.policy'
import type { RateLimitCounter } from './rate-limit.store'

export interface RateLimitRequest {
	method: string
	url: string
	ip?: string
}

export interface RateLimitReply {
	code(status: number): RateLimitReply
	header(name: string, value: string): RateLimitReply
	send(body: unknown): unknown
}

interface HookOptions {
	counter: RateLimitCounter
	/** Called when the store is unreachable, so a fail-open is never silent. */
	onStoreError?: (error: unknown) => void
}

const TOO_MANY = 429
const MESSAGE =
	'Trop de tentatives. Merci de patienter quelques minutes avant de réessayer.'

export function createRateLimitHook({ counter, onStoreError }: HookOptions) {
	return async function rateLimit(
		request: RateLimitRequest,
		reply: RateLimitReply,
	): Promise<unknown> {
		const rule = limitFor(request.method, request.url)
		if (!rule) return undefined

		let hit
		try {
			hit = await counter.hit(
				`rl:${rule.bucket}:${request.ip ?? 'unknown'}`,
				rule.windowSeconds,
			)
		} catch (error) {
			// Fail open: a limiter that cannot reach its store must not take the API
			// down with it, and an OTP nobody can request is a worse outage.
			onStoreError?.(error)
			return undefined
		}

		reply.header('RateLimit-Limit', String(rule.max))
		reply.header(
			'RateLimit-Remaining',
			String(Math.max(0, rule.max - hit.count)),
		)
		reply.header('RateLimit-Reset', String(hit.ttlSeconds))

		if (hit.count <= rule.max) return undefined

		return reply
			.code(TOO_MANY)
			.header('Retry-After', String(hit.ttlSeconds))
			.send({
				statusCode: TOO_MANY,
				message: MESSAGE,
				error: 'Too Many Requests',
			})
	}
}
