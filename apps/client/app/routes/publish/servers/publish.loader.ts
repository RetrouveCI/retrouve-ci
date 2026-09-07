import { requireServerSession } from '@/shared/helpers/session.server'
import { toContactName } from '@/shared/utils/display-name'
import type { LostItemType } from '@/shared/types/lost-item'
import { getMyStickers } from '../../account/stickers/servers/stickers.service'

export interface LinkableSticker {
	code: string
	label: string
}

/**
 * Activated ones only, being the only codes a finder can scan — and for `lost`
 * alone, since none of your stickers is on an object you just found.
 */
async function linkableStickers(
	request: Request,
	type: LostItemType,
): Promise<LinkableSticker[]> {
	if (type !== 'lost') return []

	try {
		const stickers = await getMyStickers(request)

		return stickers
			.filter(sticker => sticker.status === 'activated')
			.map(sticker => ({
				code: sticker.code,
				label: sticker.label ?? sticker.code,
			}))
	} catch {
		// An accessory field must not take the publication form down with it.
		return []
	}
}

export async function publishLoader({
	request,
	type,
}: {
	request: Request
	type: LostItemType
}) {
	const session = await requireServerSession(request)

	// What the finder reads on the listing. An account that never named itself
	// carries its own phone number, which is not a name to offer back.
	return {
		contactName: toContactName(session.user.name),
		stickers: await linkableStickers(request, type),
	}
}
