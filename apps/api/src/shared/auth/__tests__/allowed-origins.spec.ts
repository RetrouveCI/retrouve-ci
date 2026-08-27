import { describe, expect, it } from 'vitest'
import { getAllowedOrigins } from '../allowed-origins'

describe('getAllowedOrigins', () => {
	it('reads the configured list, trimming and dropping blanks', () => {
		expect(
			getAllowedOrigins({
				ALLOWED_ORIGINS:
					' https://retrouveci.com , ,https://admin.retrouveci.com ',
			} as NodeJS.ProcessEnv),
		).toEqual(['https://retrouveci.com', 'https://admin.retrouveci.com'])
	})

	it('falls back to the two local origins outside production', () => {
		expect(getAllowedOrigins({} as NodeJS.ProcessEnv)).toEqual([
			'http://localhost:3000',
			'http://localhost:3001',
		])
	})

	/**
	 * The whole point: an empty list is not a safe default, it silently refuses
	 * every browser call while the API looks healthy.
	 */
	it('throws in production when unset', () => {
		expect(() =>
			getAllowedOrigins({ NODE_ENV: 'production' } as NodeJS.ProcessEnv),
		).toThrow(/ALLOWED_ORIGINS must list the front-end origins/)
	})

	it('throws in production when set to blanks only', () => {
		expect(() =>
			getAllowedOrigins({
				NODE_ENV: 'production',
				ALLOWED_ORIGINS: ' , ',
			} as NodeJS.ProcessEnv),
		).toThrow(/ALLOWED_ORIGINS/)
	})
})
