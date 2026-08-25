import { MAX_PAGE_SIZE } from '@app/contracts/shared'
import {
	POSTS_PAGE_SIZE,
	parsePostsFilters,
	toValidDate,
} from '../parse-posts-filters'

const parse = (search: string) => parsePostsFilters(new URLSearchParams(search))

describe('parsePostsFilters', () => {
	it('asks for the first page of the listing by default', () => {
		expect(parse('')).toEqual({ page: 1, pageSize: POSTS_PAGE_SIZE })
	})

	it('reads the search box under its url name', () => {
		expect(parse('q=telephone').search).toBe('telephone')
	})

	it('keeps every filter the contract accepts', () => {
		expect(
			parse(
				'type=lost&category=electronics&ville=Abidjan&commune=Cocody&page=3',
			),
		).toMatchObject({
			type: 'lost',
			category: 'electronics',
			ville: 'Abidjan',
			commune: 'Cocody',
			page: 3,
		})
	})

	it('pins the page size to the listing, whatever the url asks', () => {
		expect(parse(`pageSize=${MAX_PAGE_SIZE}`).pageSize).toBe(POSTS_PAGE_SIZE)
	})

	// Each of these answered 400 and took the whole page down with it.
	it.each([
		['category=test', 'category'],
		['type=bidon', 'type'],
		['dateFrom=pasunedate', 'dateFrom'],
		['dateTo=32-13-2026', 'dateTo'],
	])('drops the value the contract refuses in %s', (search, field) => {
		expect(parse(search)).not.toHaveProperty(field)
	})

	it.each(['page=0', 'page=-1', 'page=abc', 'page='])(
		'falls back to the first page for %s',
		search => {
			expect(parse(search).page).toBe(1)
		},
	)

	// The whole point: one bad filter must not cost the visitor the good ones.
	it('keeps the valid filters alongside a refused one', () => {
		const filters = parse('category=test&ville=Abidjan&q=sac&page=2')

		expect(filters).not.toHaveProperty('category')
		expect(filters).toMatchObject({ ville: 'Abidjan', search: 'sac', page: 2 })
	})

	it('drops several refused filters at once', () => {
		const filters = parse('category=test&type=bidon&page=0&ville=Abidjan')

		expect(filters).not.toHaveProperty('category')
		expect(filters).not.toHaveProperty('type')
		expect(filters).toMatchObject({ page: 1, ville: 'Abidjan' })
	})

	it('ignores a query key the contract does not know', () => {
		expect(parse('sortBy=price')).toEqual({
			page: 1,
			pageSize: POSTS_PAGE_SIZE,
		})
	})
})

describe('toValidDate', () => {
	it('reads the date the picker writes', () => {
		expect(toValidDate('2026-08-01')).toEqual(new Date('2026-08-01'))
	})

	it.each([null, ''])('reports %p as no date', value => {
		expect(toValidDate(value)).toBeUndefined()
	})

	// `format()` throws on these, server-side, and the page renders as an error.
	it.each(['pasunedate', '32-13-2026', '2026-02-31T99:99'])(
		'refuses %s rather than letting format() throw',
		value => {
			expect(toValidDate(value)).toBeUndefined()
		},
	)
})
