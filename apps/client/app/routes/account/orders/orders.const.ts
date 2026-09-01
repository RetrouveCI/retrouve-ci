import type { OrderStatus } from './types/orders.types'

interface OrderStatusConfig {
	/** One word per state, used by the pill and by the rail alike. */
	label: string
	badge: string
}

export const ORDER_STATUS: Record<OrderStatus, OrderStatusConfig> = {
	pending: {
		label: 'Reçue',
		badge: 'bg-yellow-700 text-white',
	},
	processing: {
		label: 'Préparée',
		badge: 'bg-blue-600 text-white',
	},
	shipped: {
		label: 'En route',
		badge: 'bg-primary-green text-white',
	},
	delivered: {
		label: 'Livrée',
		badge: 'bg-neutral-600 text-white',
	},
	cancelled: {
		label: 'Annulée',
		badge: 'bg-red-700 text-white',
	},
}

export const UNKNOWN_ORDER_STATUS: OrderStatusConfig = {
	label: 'État inconnu',
	badge: 'bg-muted text-muted-foreground',
}

/** Widened by assignment rather than by a cast, so the map stays exhaustive. */
const LOOKUP: Partial<Record<string, OrderStatusConfig>> = ORDER_STATUS

export function orderStatusFor(status: string): OrderStatusConfig {
	return LOOKUP[status] ?? UNKNOWN_ORDER_STATUS
}

/**
 * The four steps a delivery goes through, in order. « Annulée » is not one of
 * them: a cancelled order leaves the rail behind and drops to the history.
 */
export const ORDER_STEPS = [
	'pending',
	'processing',
	'shipped',
	'delivered',
] as const satisfies readonly OrderStatus[]
