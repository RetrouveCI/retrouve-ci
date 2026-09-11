import {
	DEFAULT_PAGE_SIZE,
	pageWindow,
	pastLastPage,
	readListPage,
	readSearch,
} from '../list-params'

const params = (query: string) => new URLSearchParams(query)

describe('readListPage', () => {
	it('reads the page and a size the pager offers', () => {
		expect(readListPage(params('page=3&pageSize=50'))).toEqual({
			page: 3,
			pageSize: 50,
		})
	})

	it.each(['', 'page=0', 'page=-2', 'page=1.5', 'page=abc'])(
		'reads %j as the first page',
		query => {
			expect(readListPage(params(query)).page).toBe(1)
		},
	)

	// The API caps a page at 100; a hand-edited 1000 must not reach it.
	it.each(['pageSize=7', 'pageSize=1000', 'pageSize=x'])(
		'reads %j as the default size',
		query => {
			expect(readListPage(params(query)).pageSize).toBe(DEFAULT_PAGE_SIZE)
		},
	)
})

describe('readSearch', () => {
	it('trims the search', () => {
		expect(readSearch(params('q=%20%20RCI-7K%20'))).toBe('RCI-7K')
	})

	it('reads a blank search as none', () => {
		expect(readSearch(params('q=%20%20'))).toBeUndefined()
		expect(readSearch(params(''))).toBeUndefined()
	})

	// The contract refuses more than 100: cutting here keeps a hand-edited URL
	// from answering an error page.
	it('cuts a search at the length the contract accepts', () => {
		expect(readSearch(params(`q=${'a'.repeat(150)}`))).toHaveLength(100)
	})
})

describe('pastLastPage', () => {
	const url = new URL('http://localhost:3001/orders?status=pending&page=9')

	it('leaves a page that exists alone', () => {
		expect(pastLastPage(url, { page: 2, pageSize: 25 }, 60)).toBeNull()
	})

	it('sends a page past the end to the last one, keeping the filters', () => {
		expect(pastLastPage(url, { page: 9, pageSize: 25 }, 60)).toBe(
			'/orders?status=pending&page=3',
		)
	})

	it('drops the page param when the list fits on one page', () => {
		expect(pastLastPage(url, { page: 9, pageSize: 25 }, 4)).toBe(
			'/orders?status=pending',
		)
	})

	it('leaves an empty first page alone', () => {
		expect(pastLastPage(url, { page: 1, pageSize: 25 }, 0)).toBeNull()
	})
})

describe('pageWindow', () => {
	it('lists every page of a short list', () => {
		expect(pageWindow(2, 3)).toEqual([1, 2, 3])
	})

	it('keeps the ends and the neighbours of a long one', () => {
		expect(pageWindow(6, 12)).toEqual([1, 'gap', 5, 6, 7, 'gap', 12])
	})

	it('draws no gap where pages touch', () => {
		expect(pageWindow(2, 12)).toEqual([1, 2, 3, 'gap', 12])
	})

	it('reads a single page as one button', () => {
		expect(pageWindow(1, 1)).toEqual([1])
	})
})
