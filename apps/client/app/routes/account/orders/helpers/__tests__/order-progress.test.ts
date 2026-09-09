import { describe, expect, it } from 'vitest'
import {
	buildOrderProgress,
	formatOrderDate,
	formatPrice,
	isOrderInFlight,
} from '../order-progress'
import type { Order } from '../../types/orders.types'

function orderWith(status: Order['status']): Order {
	return {
		id: 'order-1',
		orderNumber: 'CMD-2026-000001',
		date: '2026-08-01T10:00:00.000Z',
		pack: { id: 'pack-4', name: 'Starter', quantity: 4, price: 2000 },
		deliveryFee: 1000,
		total: 3000,
		status,
		paymentMethod: 'cash-on-delivery',
		deliveryAddress: 'Rue 12, Abidjan',
	}
}

describe('buildOrderProgress', () => {
	it('draws four steps whatever the state', () => {
		expect(buildOrderProgress('pending')).toHaveLength(4)
	})

	it('marks the current step without marking it done', () => {
		const steps = buildOrderProgress('shipped')

		expect(steps.map(step => step.done)).toEqual([true, true, false, false])
		expect(steps.map(step => step.current)).toEqual([false, false, true, false])
	})

	it('has nothing done on the first step', () => {
		const steps = buildOrderProgress('pending')

		expect(steps.every(step => !step.done)).toBe(true)
		expect(steps[0]?.current).toBe(true)
	})

	it('closes the rail on a delivered order rather than leaving it pending', () => {
		const steps = buildOrderProgress('delivered')

		expect(steps.every(step => step.done)).toBe(true)
		expect(steps.some(step => step.current)).toBe(false)
	})

	it('leaves the rail empty for a state that is not a step', () => {
		const steps = buildOrderProgress('cancelled')

		expect(steps.some(step => step.done || step.current)).toBe(false)
	})

	it('names each step with the word its badge uses', () => {
		expect(buildOrderProgress('pending').map(step => step.label)).toEqual([
			'Reçue',
			'Préparée',
			'En route',
			'Livrée',
		])
	})
})

describe('isOrderInFlight', () => {
	it.each(['pending', 'processing', 'shipped'] as const)(
		'keeps %s open',
		status => {
			expect(isOrderInFlight(orderWith(status))).toBe(true)
		},
	)

	it.each(['delivered', 'cancelled'] as const)('closes %s', status => {
		expect(isOrderInFlight(orderWith(status))).toBe(false)
	})
})

describe('formatting', () => {
	it('groups thousands the French way', () => {
		expect(formatPrice(4000)).toBe('4 000')
	})

	it('spells the month out', () => {
		expect(formatOrderDate('2026-08-01T10:00:00.000Z')).toBe('1 août 2026')
	})
})
