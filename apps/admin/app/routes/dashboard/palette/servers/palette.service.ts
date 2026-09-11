import { listContactMessages } from '../../contact-messages/servers/contact-messages.service'
import { listOrders } from '../../orders/servers/orders.service'
import { listQrTokens } from '../../qr/servers/qr.service'
import type { QrTokenStatus } from '../../qr/types/qr.types'
import { searchUsers } from '../../users/servers/users.service'
import { PALETTE_RESULTS_PER_KIND } from '../palette.const'
import type { PaletteHit } from '../types/palette.types'

const STICKER_STATES: Record<QrTokenStatus, string> = {
	generated: 'généré',
	activated: 'activé',
	revoked: 'révoqué',
}

/**
 * Orders, stickers and messages go to their list narrowed by the search, since
 * they have no detail route yet (F11); stickers and people have one. Listings
 * are left out until their list reads a search (F9c).
 */
export async function searchPalette(
	query: string,
	request: Request,
): Promise<PaletteHit[]> {
	const slice = { search: query, page: 1, pageSize: PALETTE_RESULTS_PER_KIND }

	const sources: Promise<PaletteHit[]>[] = [
		listOrders(slice, request).then(({ items }) =>
			items.map((order): PaletteHit => ({
				kind: 'order',
				id: order.id,
				label: `Commande ${order.orderNumber}`,
				detail: `${order.packName} · ${order.deliveryCity}`,
				to: `/orders?q=${encodeURIComponent(order.orderNumber)}`,
			})),
		),
		listQrTokens(slice, request).then(({ items }) =>
			items.map((token): PaletteHit => ({
				kind: 'sticker',
				id: token.code,
				label: token.code,
				detail: `sticker · ${STICKER_STATES[token.status]}`,
				to: `/qr/${encodeURIComponent(token.code)}`,
			})),
		),
		listContactMessages(slice, request).then(({ items }) =>
			items.map((message): PaletteHit => ({
				kind: 'message',
				id: message.id,
				label: `${message.name} — ${message.subject}`,
				detail: 'message',
				to: `/contact-messages?q=${encodeURIComponent(query)}`,
			})),
		),
		searchUsers(request, query, PALETTE_RESULTS_PER_KIND).then(users =>
			users.map((user): PaletteHit => ({
				kind: 'user',
				id: user.id,
				label: user.name,
				detail: user.phone ?? 'personne',
				to: `/users/${encodeURIComponent(user.id)}`,
			})),
		),
	]

	// A source that fails leaves the others: three kinds are still a palette.
	const settled = await Promise.allSettled(sources)

	return settled.flatMap(result =>
		result.status === 'fulfilled' ? result.value : [],
	)
}
