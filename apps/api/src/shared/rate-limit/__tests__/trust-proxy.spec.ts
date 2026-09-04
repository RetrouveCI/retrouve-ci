import { describe, expect, it } from 'vitest'
import { getTrustProxyHops } from '../trust-proxy'

describe('getTrustProxyHops', () => {
	it('reads the configured count', () => {
		expect(getTrustProxyHops({ TRUST_PROXY_HOPS: '2' })).toBe(2)
	})

	it('allows zero, which is a deployment reached directly', () => {
		expect(getTrustProxyHops({ TRUST_PROXY_HOPS: '0' })).toBe(0)
	})

	it('assumes the one proxy Dokploy adds in production', () => {
		expect(getTrustProxyHops({ NODE_ENV: 'production' })).toBe(1)
	})

	it('trusts nobody outside production', () => {
		expect(getTrustProxyHops({})).toBe(0)
		expect(getTrustProxyHops({ NODE_ENV: 'development' })).toBe(0)
	})

	// `true` would be the tempting spelling and is the one that lets a caller
	// forge its own address, so nothing may resolve to it.
	it.each(['true', '-1', '1.5', 'one', ''])('refuses %j', value => {
		if (value === '') {
			expect(getTrustProxyHops({ TRUST_PROXY_HOPS: value })).toBe(0)
			return
		}

		expect(() => getTrustProxyHops({ TRUST_PROXY_HOPS: value })).toThrow(
			/TRUST_PROXY_HOPS/,
		)
	})
})
