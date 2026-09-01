import { ORDER_STATUS, ORDER_STEPS } from '../orders.const'
import type { Order, OrderStatus } from '../types/orders.types'

export interface OrderStep {
	id: OrderStatus
	label: string
	done: boolean
	current: boolean
}

/**
 * The rail the artboard draws, derived from the one column the API has. There
 * is no `processedAt`, so a step is « done » because the order has moved past
 * it, not because a date says when.
 */
export function buildOrderProgress(status: string): OrderStep[] {
	const steps: readonly string[] = ORDER_STEPS
	const reached = steps.indexOf(status)
	// A delivered order has no step left in front of it: the last one is done,
	// not pending.
	const isFinal = status === 'delivered'

	return ORDER_STEPS.map((id, index) => ({
		id,
		label: ORDER_STATUS[id].label,
		done: reached >= 0 && (index < reached || (isFinal && index === reached)),
		current: reached >= 0 && index === reached && !isFinal,
	}))
}

/** An order still on its way is the one the screen exists to show. */
export function isOrderInFlight(order: Order): boolean {
	return order.status !== 'delivered' && order.status !== 'cancelled'
}

export function formatPrice(price: number): string {
	return new Intl.NumberFormat('fr-FR').format(price)
}

export function formatOrderDate(value: string): string {
	return new Date(value).toLocaleDateString('fr-FR', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	})
}
