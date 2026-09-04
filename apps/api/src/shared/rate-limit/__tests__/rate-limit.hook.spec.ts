import { describe, expect, it, vi } from 'vitest'
import { createRateLimitHook } from '../rate-limit.hook'
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
