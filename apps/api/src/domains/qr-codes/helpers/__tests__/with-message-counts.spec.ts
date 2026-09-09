import { describe, expect, it } from 'vitest'
import { buildQrToken } from '../../__tests__/qr-token.fixture'
import { withMessageCounts } from '../with-message-counts'

const row = (qrTokenCode: string | null, count: number) => ({
	qrTokenCode,
	_count: { _all: count },
})

describe('withMessageCounts', () => {
	it('keys the count on the code, not on the position', () => {
		const items = [
			buildQrToken({ id: 'a', code: 'RCI-A' }),
			buildQrToken({ id: 'b', code: 'RCI-B' }),
		]

		const owned = withMessageCounts(items, [row('RCI-B', 3)])

		expect(owned.map(item => [item.code, item.messagesCount])).toEqual([
			['RCI-A', 0],
			['RCI-B', 3],
		])
	})

	// A code nobody wrote to is absent from the rows rather than zero in them.
	it('reads a sticker with no message as zero', () => {
		const owned = withMessageCounts([buildQrToken({ code: 'RCI-A' })], [])

		expect(owned[0]?.messagesCount).toBe(0)
	})

	// The column is nullable: every message sent through the web form has none.
	it('ignores the rows carrying no code', () => {
		const owned = withMessageCounts(
			[buildQrToken({ code: 'RCI-A' })],
			[row(null, 42), row('RCI-A', 1)],
		)

		expect(owned[0]?.messagesCount).toBe(1)
	})

	it('keeps every field of the token it wraps', () => {
		const token = buildQrToken({ code: 'RCI-A', label: 'Mes clés' })

		expect(withMessageCounts([token], [])[0]).toEqual({
			...token,
			messagesCount: 0,
		})
	})
})
