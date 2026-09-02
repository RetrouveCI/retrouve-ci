import { z } from 'zod'
import { parseStickerCode } from './helpers/sticker-code'

export const stickerCodeSchema = z.object({
	code: z
		.string({ error: 'Le code est requis' })
		.trim()
		.min(1, 'Le code est requis')
		.refine(
			value => parseStickerCode(value).ok,
			'Ce code ne correspond à aucun sticker RetrouveCI',
		),
})

export type StickerCodeInput = z.input<typeof stickerCodeSchema>
export type StickerCodeData = z.output<typeof stickerCodeSchema>
