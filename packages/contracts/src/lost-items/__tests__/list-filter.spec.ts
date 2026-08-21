import { describe, expect, it } from 'vitest'
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	MAX_PAGE_SIZE,
} from '../../shared/pagination'
import {
	adminListLostItemsFilterSchema,
	listLostItemsFilterSchema,
} from '../list-filter.schema'

const parse = (input: unknown) => listLostItemsFilterSchema.safeParse(input)
const parseAdmin = (input: unknown) =>
	adminListLostItemsFilterSchema.safeParse(input)

describe('listLostItemsFilterSchema', () => {
	it('keeps the pagination defaults it extends', () => {
		expect(parse({}).data).toEqual({
			page: DEFAULT_PAGE,
			pageSize: DEFAULT_PAGE_SIZE,
		})
	})

	it('accepts every filter, as the strings a query string carries', () => {
		expect(
			parse({
				type: 'found',
				category: 'keys',
				ville: '  Abidjan  ',
				commune: '  Cocody  ',
				search: '  iphone  ',
				dateFrom: '2026-01-01',
				dateTo: '2026-01-31',
				page: '2',
				pageSize: '12',
			}).data,
		).toEqual({
			type: 'found',
			category: 'keys',
			ville: 'Abidjan',
			commune: 'Cocody',
			search: 'iphone',
			dateFrom: '2026-01-01',
			dateTo: '2026-01-31',
			page: 2,
			pageSize: 12,
		})
	})

	it('refuses an unknown type or category, in French', () => {
		expect(parse({ type: 'stolen' }).error?.issues[0]?.message).toBe(
			"Type d'annonce invalide",
		)
		expect(parse({ category: 'voiture' }).error?.issues[0]?.message).toBe(
			'Catégorie invalide',
		)
	})

	it('names the boundary it refuses when a date filter is malformed', () => {
		expect(parse({ dateFrom: '01/01/2026' }).error?.issues[0]?.message).toBe(
			'Date de début invalide',
		)
		expect(parse({ dateTo: '2026-02-31' }).error?.issues[0]?.message).toBe(
			'Date de fin invalide',
		)
	})

	it('holds the pagination ceiling and floor, in French', () => {
		expect(
			parse({ pageSize: String(MAX_PAGE_SIZE + 1) }).error?.issues[0]?.message,
		).toBe(`Maximum ${MAX_PAGE_SIZE} éléments par page`)
		expect(parse({ page: '0' }).error?.issues[0]?.message).toBe(
			'La page commence à 1',
		)
	})

	// The public list is not allowed to pick its own moderation status: the
	// controller pins it to `published`, and the schema has no field for it.
	it('has no moderationStatus of its own', () => {
		expect(parse({ moderationStatus: 'hidden' }).data).not.toHaveProperty(
			'moderationStatus',
		)
	})
})

describe('adminListLostItemsFilterSchema', () => {
	it('adds a moderation status to the public filter', () => {
		expect(parseAdmin({ moderationStatus: 'pending' }).data).toEqual({
			moderationStatus: 'pending',
			page: DEFAULT_PAGE,
			pageSize: DEFAULT_PAGE_SIZE,
		})
	})

	it('refuses an unknown moderation status, in French', () => {
		expect(
			parseAdmin({ moderationStatus: 'valide' }).error?.issues[0]?.message,
		).toBe('Statut de modération invalide')
	})
})
