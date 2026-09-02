import { z } from 'zod'
import {
	QR_LABEL_MAX_LENGTH,
	QR_LINKED_OBJECT_MAX_LENGTH,
} from '@app/contracts/qr-codes'
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

/**
 * What the activation sheet posts. The code is validated by the same parser the
 * camera and the field use, so a body that reaches the action names a sticker
 * this app could have read; the two ceilings are the contract's own.
 */
export const activateScannedStickerSchema = z.object({
	code: stickerCodeSchema.shape.code,
	label: z
		.string({ error: 'Donnez un nom à ce sticker' })
		.trim()
		.min(2, 'Donnez un nom à ce sticker')
		.max(QR_LABEL_MAX_LENGTH, 'Ce nom est trop long'),
	linkedObject: z
		.string()
		.trim()
		.max(QR_LINKED_OBJECT_MAX_LENGTH, 'Cette description est trop longue')
		.optional()
		.default(''),
})

export type ActivateScannedStickerInput = z.input<
	typeof activateScannedStickerSchema
>
export type ActivateScannedStickerData = z.output<
	typeof activateScannedStickerSchema
>
