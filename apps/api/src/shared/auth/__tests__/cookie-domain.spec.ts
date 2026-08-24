import { describe, expect, it } from 'vitest'
import { getCookieDomain } from '../cookie-domain'

const CROSS_HOST_PROD = {
	NODE_ENV: 'production',
	BETTER_AUTH_URL: 'https://api.example.com',
	ALLOWED_ORIGINS: 'https://example.com,https://admin.example.com',
} as NodeJS.ProcessEnv

describe('getCookieDomain', () => {
	it('returns the configured domain, trimmed', () => {
		expect(
			getCookieDomain({
				...CROSS_HOST_PROD,
				COOKIE_DOMAIN: ' .example.com ',
			} as NodeJS.ProcessEnv),
		).toBe('.example.com')
	})

	it('throws in production when the hosts differ and it is unset', () => {
		expect(() => getCookieDomain(CROSS_HOST_PROD)).toThrow(
			/COOKIE_DOMAIN is required/,
		)
	})

	it('names both sides in the error, so the fix is obvious', () => {
		expect(() => getCookieDomain(CROSS_HOST_PROD)).toThrow(
			/api\.example\.com.*admin\.example\.com/s,
		)
	})

	it('stays undefined in production when every host matches', () => {
		expect(
			getCookieDomain({
				NODE_ENV: 'production',
				BETTER_AUTH_URL: 'https://example.com',
				ALLOWED_ORIGINS: 'https://example.com',
			} as NodeJS.ProcessEnv),
		).toBeUndefined()
	})

	/** Cookies ignore the port, so :3001 and :3002 are one host. */
	it('stays undefined on localhost, where the ports differ but the host does not', () => {
		expect(
			getCookieDomain({
				BETTER_AUTH_URL: 'http://localhost:3002',
				ALLOWED_ORIGINS: 'http://localhost:3000,http://localhost:3001',
			} as NodeJS.ProcessEnv),
		).toBeUndefined()
	})

	it('does not throw outside production, whatever the hosts', () => {
		expect(
			getCookieDomain({
				BETTER_AUTH_URL: 'https://api.example.com',
				ALLOWED_ORIGINS: 'https://admin.example.com',
			} as NodeJS.ProcessEnv),
		).toBeUndefined()
	})

	it('ignores an unparseable BETTER_AUTH_URL rather than throwing on it', () => {
		expect(
			getCookieDomain({
				NODE_ENV: 'production',
				BETTER_AUTH_URL: 'not-a-url',
				ALLOWED_ORIGINS: 'https://admin.example.com',
			} as NodeJS.ProcessEnv),
		).toBeUndefined()
	})
})
