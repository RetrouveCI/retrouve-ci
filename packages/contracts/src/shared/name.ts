import { z } from 'zod'

export const NAME_MIN_LENGTH = 2
export const NAME_MAX_LENGTH = 120

// One rule over `user.name`, which three forms used to spell differently — 120,
// 120 without a message, and 80. The `.trim()` belongs to it: « ␣␣A␣␣ » passed
// a two-character floor on whitespace.
export const fullNameSchema = z
	.string({ error: 'Votre nom est requis' })
	.trim()
	.min(NAME_MIN_LENGTH, 'Votre nom est requis')
	.max(NAME_MAX_LENGTH, 'Votre nom est trop long')
