import type { StickerOrderSource } from '@app/contracts/sticker-orders'

// An operator's vocabulary, so not in the contract — the split the moderation
// reasons use. A source added there is a type error here.
export const ORDER_SOURCE_LABELS: Record<StickerOrderSource, string> = {
	home: "Bloc de l'accueil",
	stickers_page: 'Page Stickers',
	account: 'Compte client',
	direct: 'Accès direct',
}
