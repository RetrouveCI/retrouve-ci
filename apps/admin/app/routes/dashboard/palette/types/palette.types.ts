export type PaletteHitKind =
	'listing' | 'order' | 'sticker' | 'message' | 'user'

export interface PaletteHit {
	kind: PaletteHitKind
	id: string
	label: string
	/** What the line ends on: the kind, and whatever tells two hits apart. */
	detail: string
	to: string
}
