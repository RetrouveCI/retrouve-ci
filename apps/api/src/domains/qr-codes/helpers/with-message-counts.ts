import type { OwnedQrToken, QrToken } from '../types/qr-token.types'

/** What Prisma's `groupBy` hands back, narrowed to what the merge reads. */
export interface MessageCountRow {
	qrTokenCode: string | null
	_count: { _all: number }
}

// Pure, because a `groupBy` cannot be exercised without a database — and the
// mistake to guard is a mis-keyed merge, which no query would reveal.
export function withMessageCounts(
	items: QrToken[],
	rows: MessageCountRow[],
): OwnedQrToken[] {
	const counts = new Map(
		rows
			.filter(row => row.qrTokenCode !== null)
			.map(row => [row.qrTokenCode, row._count._all]),
	)

	return items.map(item => ({
		...item,
		messagesCount: counts.get(item.code) ?? 0,
	}))
}
