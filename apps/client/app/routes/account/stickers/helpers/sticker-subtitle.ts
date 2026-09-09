import { formatShortRelativeDistance } from '@/shared/utils/date'
import type { Sticker } from '@/shared/types/sticker'

function formatDate(value: string) {
	return new Date(value).toLocaleDateString('fr-FR', {
		day: 'numeric',
		month: 'long',
	})
}

function messages(count: number) {
	if (count < 1) return ''

	return ` · ${count} message${count > 1 ? 's' : ''}`
}

// « Scanné il y a 2 h · 1 message » once someone has read the sticker: the
// artboard has the trace replace the code line rather than add a third one.
export function buildStickerSubtitle(sticker: Sticker) {
	if (sticker.status === 'generated') return 'Activez-le pour le nommer'

	if (sticker.lastScannedAt) {
		const when = formatShortRelativeDistance(sticker.lastScannedAt)

		return `Scanné ${when}${messages(sticker.messagesCount)}`
	}

	const activated = sticker.activatedAt
		? ` · activé le ${formatDate(sticker.activatedAt)}`
		: ''

	return `${sticker.code}${activated}`
}
