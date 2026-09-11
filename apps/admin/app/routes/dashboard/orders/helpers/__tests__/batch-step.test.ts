import { batchStep } from '../batch-step'
import type { StickerOrder, OrderStatus } from '../../types/orders.types'

const order = (id: string, status: OrderStatus) =>
	({ id, status }) as StickerOrder

describe('batchStep', () => {
	it.each([
		['pending', 'processing'],
		['processing', 'shipped'],
		['shipped', 'delivered'],
	] as const)('offers %s the step to %s', (from, to) => {
		const orders = [order('a', from), order('b', from)]

		expect(batchStep(orders, ['a', 'b'])).toMatchObject({
			kind: 'ready',
			status: to,
		})
	})

	// The safety rail: each transition tells a buyer, so a mixed selection would
	// send several different promises from one click.
	it('refuses a selection at two different statuses', () => {
		const orders = [order('a', 'pending'), order('b', 'shipped')]

		expect(batchStep(orders, ['a', 'b'])).toEqual({
			kind: 'blocked',
			reason: 'Sélectionnez des commandes au même statut',
		})
	})

	it.each(['delivered', 'cancelled'] as const)(
		'offers nothing beyond %s',
		status => {
			expect(batchStep([order('a', status)], ['a'])).toEqual({
				kind: 'blocked',
				reason: 'Aucune étape suivante pour ce statut',
			})
		},
	)

	it('reads an empty selection as nothing to do', () => {
		expect(batchStep([order('a', 'pending')], [])).toMatchObject({
			kind: 'blocked',
		})
	})

	// A selection is bound to the page, but an id that is not on it must not
	// silently decide the step for the rest.
	it('looks only at the rows it was given', () => {
		const orders = [order('a', 'pending')]

		expect(batchStep(orders, ['a', 'ghost'])).toMatchObject({
			kind: 'ready',
			status: 'processing',
		})
	})
})
