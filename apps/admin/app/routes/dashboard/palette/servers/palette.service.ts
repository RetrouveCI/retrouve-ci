import { listContactMessages } from '../../contact-messages/servers/contact-messages.service'
import { listOrders } from '../../orders/servers/orders.service'
import { listPosts } from '../../posts/servers/posts.service'
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

/** Every hit opens its own page. */
export async function searchPalette(
	query: string,
	request: Request,
): Promise<PaletteHit[]> {
	const slice = { search: query, page: 1, pageSize: PALETTE_RESULTS_PER_KIND }

	const sources: Promise<PaletteHit[]>[] = [
		listPosts(slice, request).then(({ items }) =>
			items.map((post): PaletteHit => ({
				kind: 'listing',
				id: post.id,
				label: post.title,
				detail: `annonce · ${post.ville}`,
				to: `/posts/${encodeURIComponent(post.id)}`,
			})),
		),
		listOrders(slice, request).then(({ items }) =>
			items.map((order): PaletteHit => ({
				kind: 'order',
				id: order.id,
				label: `Commande ${order.orderNumber}`,
				detail: `${order.packName} · ${order.deliveryCity}`,
				to: `/orders/${encodeURIComponent(order.id)}`,
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
				to: `/contact-messages/${encodeURIComponent(message.id)}`,
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

	// A source that fails leaves the others: four kinds are still a palette.
	const settled = await Promise.allSettled(sources)

	return settled.flatMap(result =>
		result.status === 'fulfilled' ? result.value : [],
	)
}
