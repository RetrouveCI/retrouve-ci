import { z } from 'zod'

// The shape `PushSubscription.toJSON()` produces, taken as it comes. The
// endpoint is a vendor URL and goes in a unique index, so it is bounded well
// above what FCM, Mozilla and WNS emit.
export const PUSH_ENDPOINT_MAX_LENGTH = 1024

// ⚠️ Decoded size is the invariant, encoded length derives from it: `toJSON()`
// emits base64url **unpadded**, and the padded 88/24 refused every real one.
export const PUSH_P256DH_BYTES = 65
export const PUSH_AUTH_BYTES = 16

const encodedLength = (bytes: number) => Math.ceil((bytes * 4) / 3)

export const PUSH_P256DH_LENGTH = encodedLength(PUSH_P256DH_BYTES)
export const PUSH_AUTH_LENGTH = encodedLength(PUSH_AUTH_BYTES)

const BASE64URL = /^[A-Za-z0-9_-]+=*$/

export const pushSubscriptionSchema = z.object({
	endpoint: z
		.string({ error: "L'adresse d'abonnement est requise" })
		.trim()
		.max(
			PUSH_ENDPOINT_MAX_LENGTH,
			`L'adresse d'abonnement ne peut pas dépasser ${PUSH_ENDPOINT_MAX_LENGTH} caractères`,
		)
		.refine(
			value => value.startsWith('https://'),
			"L'adresse d'abonnement doit être en https",
		),
	keys: z.object(
		{
			p256dh: z
				.string({ error: 'La clé publique est requise' })
				.trim()
				.length(PUSH_P256DH_LENGTH, 'La clé publique est invalide')
				.regex(BASE64URL, 'La clé publique est invalide'),
			auth: z
				.string({ error: 'Le secret est requis' })
				.trim()
				.length(PUSH_AUTH_LENGTH, 'Le secret est invalide')
				.regex(BASE64URL, 'Le secret est invalide'),
		},
		{ error: "Les clés d'abonnement sont requises" },
	),
})

// Sent by the browser and ignored: no vendor populates it, and an expiry the
// server trusted would drop a subscription that still works.
export const pushUnsubscribeSchema = pushSubscriptionSchema.pick({
	endpoint: true,
})

export type PushSubscriptionInput = z.input<typeof pushSubscriptionSchema>
export type PushSubscriptionData = z.output<typeof pushSubscriptionSchema>

export type PushUnsubscribeInput = z.input<typeof pushUnsubscribeSchema>
export type PushUnsubscribeData = z.output<typeof pushUnsubscribeSchema>
