import { z } from 'zod'
import { generateQrTokensSchema } from '@app/contracts/qr-codes'

export const generateQrSchema = generateQrTokensSchema.extend({
	exportCSV: z.boolean(),
})

/** The CSV download never leaves the browser, so the action ignores that field. */
export const generateQrPayloadSchema = generateQrSchema.omit({
	exportCSV: true,
})

export type GenerateQrInput = z.input<typeof generateQrSchema>
export type GenerateQrData = z.output<typeof generateQrSchema>
