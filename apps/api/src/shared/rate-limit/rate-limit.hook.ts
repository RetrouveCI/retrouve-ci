import { limitFor } from './rate-limit.policy'
import type { RateLimitCounter } from './rate-limit.store'

export interface RateLimitRequest {
	method: string
	url: string
	ip?: string
	headers?: Record<string, string | string[] | undefined>
}

/** Set by a front calling for a visitor: its server is the socket peer there. */
export const CLIENT_IP_HEADER = 'x-client-ip'

/** IPv4, IPv6, and nothing else: the value ends up inside a Redis key. */
const ADDRESS = /^[0-9a-f.:]{3,45}$/i

// Trusted as given: the API is not meant to be reachable outside its network,
// and a spoofed value lifts only a per-caller cap, never the per-number one.
export function callerOf(request: RateLimitRequest): string {
	const raw = request.headers?.[CLIENT_IP_HEADER]
	const value = Array.isArray(raw) ? raw[0] : raw

	if (value !== undefined && ADDRESS.test(value)) return value

	return request.ip ?? 'unknown'
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
				`rl:${rule.bucket}:${callerOf(request)}`,
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
