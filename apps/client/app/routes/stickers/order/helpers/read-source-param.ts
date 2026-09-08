import {
	DEFAULT_STICKER_ORDER_SOURCE,
	STICKER_ORDER_SOURCES,
	type StickerOrderSource,
} from '@app/contracts/sticker-orders'

/** One of the four the contract names, or the default. Never the URL's word. */
export function readSourceParam(value: string | null): StickerOrderSource {
	const named = STICKER_ORDER_SOURCES.find(source => source === value)

	return named ?? DEFAULT_STICKER_ORDER_SOURCE
}
