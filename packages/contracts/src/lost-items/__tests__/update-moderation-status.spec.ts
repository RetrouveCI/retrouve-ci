import { describe, expect, it } from 'vitest'
import {
	LOST_ITEM_CATEGORIES,
	LOST_ITEM_TYPES,
	MAX_MODERATION_NOTE_LENGTH,
	MODERATION_REASONS,
	MODERATION_STATUSES,
} from '../lost-items.const'
import { lostItemCategorySchema, lostItemTypeSchema } from '../enums.schema'
import { updateModerationStatusSchema } from '../update-moderation-status.schema'

const parse = (input: unknown) => updateModerationStatusSchema.safeParse(input)

describe('updateModerationStatusSchema', () => {
	it.each(MODERATION_STATUSES)('accepts %s', moderationStatus => {
		expect(parse({ moderationStatus }).data).toEqual({ moderationStatus })
	})

	it('refuses an unknown status, in French', () => {
		expect(
			parse({ moderationStatus: 'valide' }).error?.issues[0]?.message,
		).toBe('Statut de modération invalide')
	})

	it('requires the status', () => {
		expect(parse({}).error?.issues[0]?.message).toBe(
			'Statut de modération invalide',
		)
	})
})

describe('the reason a listing was hidden', () => {
	const hide = (extra: Record<string, unknown>) =>
		parse({ moderationStatus: 'hidden', ...extra })

	// Hiding without saying why stays possible: the reason is a courtesy the
	// backoffice may not always be able to word.
	it('is optional', () => {
		expect(hide({}).success).toBe(true)
	})

	it.each(MODERATION_REASONS.filter(reason => reason !== 'other'))(
		'accepts %s on its own',
		moderationReason => {
			expect(hide({ moderationReason }).data?.moderationReason).toBe(
				moderationReason,
			)
		},
	)

	it('refuses a reason the contract does not know, in French', () => {
		expect(
			hide({ moderationReason: 'parce_que' }).error?.issues[0]?.message,
		).toBe('Motif de modération invalide')
	})

	// A reason explains a removal; against a published listing it would be a
	// note about nothing, and A7's projection would have to hide it forever.
	it.each(['published', 'pending'] as const)(
		'refuses a reason on the way to %s',
		moderationStatus => {
			const result = parse({
				moderationStatus,
				moderationReason: 'duplicate',
			})

			expect(result.error?.issues[0]?.message).toBe(
				"Un motif ne s'attache qu'à un masquage",
			)
		},
	)

	it('demands a note behind « Autre », and nowhere else', () => {
		expect(hide({ moderationReason: 'other' }).error?.issues[0]?.message).toBe(
			'Précisez le motif',
		)
		expect(
			hide({ moderationReason: 'other', moderationReasonNote: 'La 2e photo.' })
				.success,
		).toBe(true)
		expect(
			hide({ moderationReason: 'duplicate', moderationReasonNote: 'Doublon' })
				.error?.issues[0]?.message,
		).toBe('La précision est réservée au motif « Autre »')
	})

	it('bounds the note', () => {
		expect(
			hide({
				moderationReason: 'other',
				moderationReasonNote: 'x'.repeat(MAX_MODERATION_NOTE_LENGTH + 1),
			}).error?.issues[0]?.message,
		).toBe(`Maximum ${MAX_MODERATION_NOTE_LENGTH} caractères`)
	})
})

describe('the enumerations the two fronts used to declare themselves', () => {
	it.each(LOST_ITEM_TYPES)('accepts the %s type', type => {
		expect(lostItemTypeSchema.safeParse(type).success).toBe(true)
	})

	it.each(LOST_ITEM_CATEGORIES)('accepts the %s category', category => {
		expect(lostItemCategorySchema.safeParse(category).success).toBe(true)
	})

	it('carries the nine categories the client lists', () => {
		expect(LOST_ITEM_CATEGORIES).toHaveLength(9)
	})
})
