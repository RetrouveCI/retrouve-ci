import { describe, expect, it } from 'vitest'
import { getAdminOrigins, resolveAudience } from './session-audience'

const ADMIN_ORIGINS = ['https://admin.retrouve.ci']

const audienceFor = (
	origin: string | undefined,
	audienceHeader?: string,
): string =>
	resolveAudience({ origin, audienceHeader, adminOrigins: ADMIN_ORIGINS })

describe('resolveAudience', () => {
	it('reads a backoffice origin as the admin audience', () => {
		expect(audienceFor('https://admin.retrouve.ci')).toBe('admin')
	})

	it('reads any other origin as the public audience', () => {
		expect(audienceFor('https://retrouve.ci')).toBe('public')
		expect(audienceFor('https://evil.example')).toBe('public')
	})

	it('ignores the header when an origin is present, so a page cannot claim the other audience', () => {
		expect(audienceFor('https://retrouve.ci', 'admin')).toBe('public')
	})

	it('falls back to the header when there is no origin, for server-side calls', () => {
		expect(audienceFor(undefined, 'admin')).toBe('admin')
		expect(audienceFor(undefined, 'public')).toBe('public')
	})

	it('defaults to the public audience with neither origin nor header', () => {
		expect(audienceFor(undefined)).toBe('public')
		expect(audienceFor(undefined, 'nonsense')).toBe('public')
	})
})

describe('getAdminOrigins', () => {
	it('reads and trims the configured origins', () => {
		expect(
			getAdminOrigins({
				ADMIN_ORIGINS: ' https://admin.retrouve.ci , https://bo.retrouve.ci ',
			}),
		).toEqual(['https://admin.retrouve.ci', 'https://bo.retrouve.ci'])
	})

	it('falls back to the local backoffice outside production', () => {
		expect(getAdminOrigins({})).toEqual(['http://localhost:3001'])
		expect(getAdminOrigins({ ADMIN_ORIGINS: '' })).toEqual([
			'http://localhost:3001',
		])
	})

	it('refuses to start in production without the origins', () => {
		expect(() => getAdminOrigins({ NODE_ENV: 'production' })).toThrow(
			/ADMIN_ORIGINS/,
		)
	})

	it('uses the configured origins in production', () => {
		expect(
			getAdminOrigins({
				NODE_ENV: 'production',
				ADMIN_ORIGINS: 'https://admin.retrouve.ci',
			}),
		).toEqual(['https://admin.retrouve.ci'])
	})
})
