import { describe, expect, it } from 'vitest'
import { DELIVERY_FEE } from '../constants'
import { computeDeliveryFee } from './compute-delivery-fee'

describe('computeDeliveryFee', () => {
	it('returns the standard delivery fee when no coupon is provided', () => {
		expect(computeDeliveryFee()).toBe(DELIVERY_FEE)
	})

	it('returns the standard delivery fee for an invalid coupon', () => {
		expect(computeDeliveryFee('INVALID')).toBe(DELIVERY_FEE)
	})

	it('returns 0 for a valid free-delivery coupon', () => {
		expect(computeDeliveryFee('RETROUVECI')).toBe(0)
	})

	it('is case-insensitive', () => {
		expect(computeDeliveryFee('retrouveci')).toBe(0)
	})
})
