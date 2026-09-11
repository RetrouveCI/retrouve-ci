import { NEXT_ORDER_STATUS } from '../orders.const'
import type { OrderStatus, StickerOrder } from '../types/orders.types'

export type BatchStep =
	| { kind: 'ready'; status: OrderStatus; label: string }
	| { kind: 'blocked'; reason: string }

/**
 * ⚠️ What a selection of orders may be moved to — and only when every one of
 * them is at the same step. Each transition tells the buyer, and the shipping
 * notice names the cash to have ready for the courier: a mixed selection would
 * send several different promises from one click, and the operator would not
 * know which went where.
 *
 * So the rule is refusal, not cleverness. A mixed selection says so and offers
 * nothing; the operator narrows by the status chip, which is one click away.
 */
export function batchStep(
	orders: StickerOrder[],
	selected: string[],
): BatchStep {
	const picked = orders.filter(order => selected.includes(order.id))

	if (picked.length === 0) {
		return { kind: 'blocked', reason: 'Rien de sélectionné sur cette page' }
	}

	const statuses = new Set(picked.map(order => order.status))

	if (statuses.size > 1) {
		return {
			kind: 'blocked',
			reason: 'Sélectionnez des commandes au même statut',
		}
	}

	const [status] = [...statuses]
	const next = status ? NEXT_ORDER_STATUS[status] : null

	if (!next) {
		return { kind: 'blocked', reason: 'Aucune étape suivante pour ce statut' }
	}

	return { kind: 'ready', status: next.status, label: next.label }
}
