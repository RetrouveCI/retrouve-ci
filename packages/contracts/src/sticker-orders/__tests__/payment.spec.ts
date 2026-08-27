import { describe, expect, it } from 'vitest'
import {
	PAYMENT_ON_DELIVERY,
	PAYMENT_ON_DELIVERY_LABEL,
	stickerPaymentMethodLabel,
} from '../sticker-orders.const'

describe('stickerPaymentMethodLabel', () => {
	// The stored id is what `CreateStickerOrderUseCase` stamps on every order, and
	// it is not French: a screen rendering it raw shows `cash-on-delivery`.
	it('names the stored id in French', () => {
		expect(stickerPaymentMethodLabel(PAYMENT_ON_DELIVERY)).toBe(
			PAYMENT_ON_DELIVERY_LABEL,
		)
		expect(stickerPaymentMethodLabel(PAYMENT_ON_DELIVERY)).toBe(
			'Paiement à la livraison',
		)
	})

	// An order placed before payment moved to delivery holds the mobile-money
	// method it was really paid with; rewriting it would misreport that order.
	it.each(['Orange Money', 'Wave', 'MTN MoMo'])(
		'leaves the older method %s as it was recorded',
		method => {
			expect(stickerPaymentMethodLabel(method)).toBe(method)
		},
	)

	it('does not invent a label for a value it does not know', () => {
		expect(stickerPaymentMethodLabel('')).toBe('')
		expect(stickerPaymentMethodLabel('bitcoin')).toBe('bitcoin')
	})
})
