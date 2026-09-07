import { describe, expect, it, vi } from 'vitest'
import {
	CLIENT_IP_HEADER,
	callerOf,
	createRateLimitHook,
} from '../rate-limit.hook'
import type { RateLimitCounter } from '../rate-limit.store'

function fakeReply() {
	const headers: Record<string, string> = {}
	const reply = {
		status: 0 as number,
		body: undefined as unknown,
		headers,
		code(status: number) {
			reply.status = status
			return reply
		},
		header(name: string, value: string) {
			headers[name] = value
			return reply
		},
		send(body: unknown) {
			reply.body = body
			return reply
		},
	}
	return reply
}

function counterAt(count: number, ttlSeconds = 300): RateLimitCounter {
	return {
		hit: vi.fn().mockResolvedValue({ count, ttlSeconds }),
		close: vi.fn(),
	}
}

describe('the rate limit hook', () => {
	it('ignores a request no rule covers, without touching the store', async () => {
		const counter = counterAt(1)
		const reply = fakeReply()

		await createRateLimitHook({ counter })(
			{ method: 'GET', url: '/lost-items', ip: '1.1.1.1' },
			reply,
		)

		expect(counter.hit).not.toHaveBeenCalled()
		expect(reply.status).toBe(0)
	})

	it('counts a covered request per bucket and per address', async () => {
		const counter = counterAt(1)

		await createRateLimitHook({ counter })(
			{ method: 'POST', url: '/api/auth/phone-number/send-otp', ip: '9.9.9.9' },
			fakeReply(),
		)

		expect(counter.hit).toHaveBeenCalledWith('rl:otp:9.9.9.9', 900)
	})

	it('lets the last allowed request through and says none is left', async () => {
		const reply = fakeReply()

		await createRateLimitHook({ counter: counterAt(5) })(
			{ method: 'POST', url: '/api/auth/phone-number/send-otp', ip: '1.1.1.1' },
			reply,
		)

		expect(reply.status).toBe(0)
		expect(reply.headers['RateLimit-Remaining']).toBe('0')
	})

	it('answers 429 in French once the budget is spent', async () => {
		const reply = fakeReply()

		await createRateLimitHook({ counter: counterAt(6, 420) })(
			{ method: 'POST', url: '/api/auth/phone-number/send-otp', ip: '1.1.1.1' },
			reply,
		)

		expect(reply.status).toBe(429)
		expect(reply.headers['Retry-After']).toBe('420')
		expect(reply.body).toEqual({
			statusCode: 429,
			message:
				'Trop de tentatives. Merci de patienter quelques minutes avant de réessayer.',
			error: 'Too Many Requests',
		})
	})

	// An OTP nobody can request is a worse outage than one nobody counts.
	it('fails open, loudly, when the store is unreachable', async () => {
		const onStoreError = vi.fn()
		const counter: RateLimitCounter = {
			hit: vi.fn().mockRejectedValue(new Error('ECONNREFUSED')),
			close: vi.fn(),
		}
		const reply = fakeReply()

		await createRateLimitHook({ counter, onStoreError })(
			{ method: 'POST', url: '/api/auth/phone-number/send-otp', ip: '1.1.1.1' },
			reply,
		)

		expect(reply.status).toBe(0)
		expect(onStoreError).toHaveBeenCalledOnce()
	})

	it('keeps a request with no address in its own bucket', async () => {
		const counter = counterAt(1)

		await createRateLimitHook({ counter })(
			{ method: 'POST', url: '/contact-messages' },
			fakeReply(),
		)

		expect(counter.hit).toHaveBeenCalledWith('rl:public-write:unknown', 3600)
	})
})

// R44. Every capped route but the browser-side sign-in is reached by a front's
// server, so `request.ip` named that container: 5 OTPs / 15 min, platform-wide.
describe('callerOf', () => {
	const on = (value: string | string[] | undefined, ip = '10.0.0.5') =>
		callerOf({
			method: 'POST',
			url: '/api/auth/phone-number/send-otp',
			ip,
			headers: value === undefined ? {} : { [CLIENT_IP_HEADER]: value },
		})

	it.each(['41.66.1.1', '2001:db8::1', '::1'])(
		'takes %s from the header',
		v => {
			expect(on(v)).toBe(v)
		},
	)

	it('reads the first value of a repeated header', () => {
		expect(on(['41.66.1.1', '41.66.1.2'])).toBe('41.66.1.1')
	})

	it('falls back to the socket address when no front spoke for a visitor', () => {
		expect(on(undefined)).toBe('10.0.0.5')
		expect(callerOf({ method: 'POST', url: '/x' })).toBe('unknown')
	})

	// It lands inside a Redis key, so anything but an address is dropped.
	it.each([
		'41.66.1.1, 10.0.0.5',
		'evil.example.com',
		'41.66.1.1\nrl:otp:x',
		'',
		'ab',
		'1'.repeat(46),
	])('ignores %o and keeps the socket address', value => {
		expect(on(value)).toBe('10.0.0.5')
	})

	it('is what the bucket key is built from', async () => {
		const counter = counterAt(1)

		await createRateLimitHook({ counter })(
			{
				method: 'POST',
				url: '/api/auth/phone-number/send-otp',
				ip: '10.0.0.5',
				headers: { [CLIENT_IP_HEADER]: '41.66.1.1' },
			},
			fakeReply(),
		)

		expect(counter.hit).toHaveBeenCalledWith('rl:otp:41.66.1.1', 900)
	})
})
