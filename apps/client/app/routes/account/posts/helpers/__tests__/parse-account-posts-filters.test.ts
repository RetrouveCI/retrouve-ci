import {
	ACCOUNT_POSTS_PAGE_SIZE,
	parseAccountPostsFilters,
} from '../parse-account-posts-filters'

const parse = (query: string) =>
	parseAccountPostsFilters(new URLSearchParams(query))

describe('parseAccountPostsFilters', () => {
	it('pins the page size the screen draws', () => {
		expect(parse('')).toEqual({ page: 1, pageSize: ACCOUNT_POSTS_PAGE_SIZE })
	})

	it('renames the two keys the URL spells shorter', () => {
		expect(parse('q=sac&status=resolved')).toMatchObject({
			search: 'sac',
			resolutionStatus: 'resolved',
		})
	})

	it('reads the page as a number', () => {
		expect(parse('page=4')).toMatchObject({ page: 4 })
	})

	it('accepts the three lifecycle values a pill can select', () => {
		for (const status of ['active', 'resolved', 'expired'])
			expect(parse(`status=${status}`)).toMatchObject({
				resolutionStatus: status,
			})
	})

	/**
	 * A search param is whatever was left in the address bar. Handing it to the
	 * API unchecked answered 400, which the loader rendered as a full error page —
	 * an account's own listings lost to one bad character.
	 */
	it('drops a lifecycle status the contract does not know', () => {
		expect(parse('status=archivee')).toEqual({
			page: 1,
			pageSize: ACCOUNT_POSTS_PAGE_SIZE,
		})
	})

	it('keeps the filters around the one it drops', () => {
		expect(parse('status=perdue&q=clés')).toEqual({
			search: 'clés',
			page: 1,
			pageSize: ACCOUNT_POSTS_PAGE_SIZE,
		})
	})

	it('falls back to the first page when the page is not one', () => {
		expect(parse('page=0')).toMatchObject({ page: 1 })
		expect(parse('page=-2')).toMatchObject({ page: 1 })
		expect(parse('page=deux')).toMatchObject({ page: 1 })
	})

	it('ignores a page size the URL tries to raise', () => {
		expect(parse('pageSize=100')).toMatchObject({
			pageSize: ACCOUNT_POSTS_PAGE_SIZE,
		})
	})

	// The contract trims, and the trim has to reach the API or « sac » and « sac »
	// would be two different searches.
	it('trims the search the way the contract does', () => {
		expect(parse('q=%20%20sac%20%20')).toMatchObject({ search: 'sac' })
	})

	it('drops a filter the URL spells empty', () => {
		expect(parse('q=&status=')).toEqual({
			page: 1,
			pageSize: ACCOUNT_POSTS_PAGE_SIZE,
		})
	})
})
