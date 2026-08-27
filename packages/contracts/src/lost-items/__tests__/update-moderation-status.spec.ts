import { describe, expect, it } from 'vitest'
import {
	LOST_ITEM_CATEGORIES,
	LOST_ITEM_TYPES,
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
