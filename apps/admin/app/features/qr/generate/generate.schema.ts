import { z } from 'zod'

export const generateQrSchema = z.object({
	count: z.coerce.number().int().min(1, 'Minimum 1').max(1000, 'Maximum 1000'),
	batch: z.string().max(60).optional(),
	exportCSV: z.enum(['on']).optional(),
})
