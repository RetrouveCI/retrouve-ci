import { z } from 'zod'
import { MAX_GENERATE_COUNT, MIN_GENERATE_COUNT } from './qr-codes.const'

// Not `z.coerce`: its `z.input` is `unknown` in Zod 4, and the admin form types
// its quantity field on the input. The union needs its own message, or a
// non-numeric entry reports in English.
const countable = z.union(
	[z.number().int(), z.string().regex(/^\d+$/).transform(Number)],
	{ error: 'Entrez un nombre entier' },
)

export const generateQrTokensSchema = z.object({
	count: countable.pipe(
		z
			.number()
			.int()
			.min(MIN_GENERATE_COUNT, `Minimum ${MIN_GENERATE_COUNT}`)
			.max(MAX_GENERATE_COUNT, `Maximum ${MAX_GENERATE_COUNT}`),
	),
	batch: z.string().trim().max(60, 'Maximum 60 caractères').optional(),
})

export type GenerateQrTokensInput = z.input<typeof generateQrTokensSchema>
export type GenerateQrTokensData = z.output<typeof generateQrTokensSchema>
