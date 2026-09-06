import { z } from 'zod'

/**
 * The two ways a finder may be handed the owner's line. Both show the number in
 * the phone that jumps, which is why both are gated on `directContact`.
 */
export const REACH_CHANNELS = ['call', 'whatsapp'] as const

export type ReachChannel = (typeof REACH_CHANNELS)[number]

export const reachOwnerSchema = z.object({
	channel: z.enum(REACH_CHANNELS, {
		error: 'Choisissez un moyen de contact valide',
	}),
})

export type ReachOwnerInput = z.input<typeof reachOwnerSchema>
export type ReachOwnerData = z.output<typeof reachOwnerSchema>
