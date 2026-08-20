import { z } from 'zod'

export const generateQrSchema = z.object({
	count: z.coerce
		.number<string>()
		.int()
		.min(1, 'Minimum 1')
		.max(1000, 'Maximum 1000'),
	batch: z.string().max(60, 'Maximum 60 caractères').optional(),
	exportCSV: z.boolean(),
})

/** The CSV download never leaves the browser, so the action ignores that field. */
export const generateQrPayloadSchema = generateQrSchema.omit({
	exportCSV: true,
})

export type GenerateQrInput = z.input<typeof generateQrSchema>
export type GenerateQrData = z.output<typeof generateQrSchema>
