import type { Sticker } from '@/shared/types/sticker'
import { buildStickerSubtitle } from '../sticker-subtitle'

const sticker = (overrides: Partial<Sticker> = {}): Sticker => ({
	id: 'sticker-1',
	code: 'RCI-4A7F-2K91',
	status: 'activated',
	isActive: true,
	label: 'Clés de la maison',
	linkedObject: null,
	directContact: false,
	activatedAt: '2026-08-14T10:00:00.000Z',
	lastScannedAt: null,
	messagesCount: 0,
	...overrides,
})

const hoursAgo = (hours: number) =>
	new Date(Date.now() - hours * 3600 * 1000).toISOString()

describe('buildStickerSubtitle', () => {
	it('asks an unactivated sticker to be named', () => {
		expect(buildStickerSubtitle(sticker({ status: 'generated' }))).toBe(
			'Activez-le pour le nommer',
		)
	})

	it('shows the code and the activation date until it is scanned', () => {
		expect(buildStickerSubtitle(sticker())).toBe(
			'RCI-4A7F-2K91 · activé le 14 août',
		)
	})

	// The artboard's line, and the reason this lot exists.
	it('replaces the code with the trace once it is scanned', () => {
		const subtitle = buildStickerSubtitle(
			sticker({ lastScannedAt: hoursAgo(2), messagesCount: 1 }),
		)

		expect(subtitle).toBe('Scanné il y a 2 heures · 1 message')
		expect(subtitle).not.toContain('RCI-4A7F-2K91')
	})

	it.each([
		[0, 'Scanné il y a 2 heures'],
		[1, 'Scanné il y a 2 heures · 1 message'],
		[3, 'Scanné il y a 2 heures · 3 messages'],
	])('reads %o messages as %o', (messagesCount, expected) => {
		expect(
			buildStickerSubtitle(
				sticker({ lastScannedAt: hoursAgo(2), messagesCount }),
			),
		).toBe(expected)
	})

	// A sticker activated by a scan carries both, and the trace is the newer fact.
	it('prefers the trace over the activation date', () => {
		expect(
			buildStickerSubtitle(
				sticker({
					activatedAt: '2026-08-14T10:00:00.000Z',
					lastScannedAt: hoursAgo(1),
				}),
			),
		).toBe('Scanné il y a 1 heure')
	})
})
