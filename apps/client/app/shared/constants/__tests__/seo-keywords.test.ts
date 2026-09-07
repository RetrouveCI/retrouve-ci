import { readFileSync } from 'node:fs'
import { SEO_KEYWORDS, SEO_KEYWORDS_CONTENT } from '../seo-keywords'

describe('the SEO keywords', () => {
	it('carries every term, comma separated', () => {
		expect(SEO_KEYWORDS_CONTENT.split(', ')).toEqual([...SEO_KEYWORDS])
	})

	it('repeats none of them, whatever the casing', () => {
		const lowered = SEO_KEYWORDS.map(term => term.toLowerCase())

		expect(lowered).toEqual([...new Set(lowered)])
	})

	it('holds no blank or padded term, which would split badly', () => {
		for (const term of SEO_KEYWORDS) {
			expect(term, JSON.stringify(term)).toBe(term.trim())
			expect(term.length).toBeGreaterThan(0)
		}
	})

	it('holds no comma inside a term', () => {
		expect(SEO_KEYWORDS.filter(term => term.includes(','))).toEqual([])
	})
})

// The promise the list makes: adding a term never means opening `root.tsx`.
describe('the keywords tag', () => {
	const root = readFileSync('app/root.tsx', 'utf8')

	it('is fed from the list and not spelled out in the root', () => {
		expect(root).toContain('SEO_KEYWORDS_CONTENT')
		expect(root).toMatch(/name: 'keywords', content: SEO_KEYWORDS_CONTENT/)
	})

	// Not « no term appears »: the description shares its vocabulary.
	it('never spells the content out as a literal', () => {
		expect(root).not.toMatch(/name: 'keywords',\s*content:\s*['"`]/)
	})
})
