import { structuredData } from '../structured-data'

const ORIGIN = 'https://retrouveci.com'

describe('structuredData', () => {
	const parsed = JSON.parse(structuredData(ORIGIN)) as Record<string, unknown>[]

	it('describes the site and the organisation, and nothing else', () => {
		expect(parsed.map(entry => entry['@type'])).toEqual([
			'WebSite',
			'Organization',
		])
	})

	it('points the search action at the query the listings page reads', () => {
		const action = parsed[0]?.potentialAction as {
			target: { urlTemplate: string }
			'query-input': string
		}

		expect(action.target.urlTemplate).toBe(
			`${ORIGIN}/posts?q={search_term_string}`,
		)
		expect(action['query-input']).toBe('required name=search_term_string')
	})

	it('carries absolute urls only', () => {
		for (const url of [parsed[0]?.url, parsed[1]?.url, parsed[1]?.logo]) {
			expect(String(url).startsWith(ORIGIN), String(url)).toBe(true)
		}
	})

	it('escapes every angle bracket', () => {
		expect(structuredData('https://x.test/<script>')).not.toContain('<')
	})
})
