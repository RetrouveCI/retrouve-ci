import { describe, expect, it } from 'vitest'
import { MAX_GENERATE_COUNT } from '../constants'
import { InvalidQrTokenError } from '../errors/qr-token.errors'
import { validateGenerateQrTokens } from './qr-token.validator'

describe('validateGenerateQrTokens', () => {
	it('accepts a valid count', () => {
		expect(() => validateGenerateQrTokens({ count: 10 })).not.toThrow()
	})

	it('rejects a count of 0', () => {
		expect(() => validateGenerateQrTokens({ count: 0 })).toThrow(
			InvalidQrTokenError,
		)
	})

	it('rejects a count above the maximum', () => {
		expect(() =>
			validateGenerateQrTokens({ count: MAX_GENERATE_COUNT + 1 }),
		).toThrow(InvalidQrTokenError)
	})
})
