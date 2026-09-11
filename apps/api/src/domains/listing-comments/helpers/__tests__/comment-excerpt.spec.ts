import { describe, expect, it } from 'vitest'
import { commentExcerpt } from '../comment-excerpt'

describe('commentExcerpt', () => {
	it('quotes a short comment whole', () => {
		expect(commentExcerpt('Précisez la commune')).toBe('Précisez la commune')
	})

	it('folds line breaks into one line', () => {
		expect(commentExcerpt(' Ajoutez\n\nune photo ')).toBe('Ajoutez une photo')
	})

	it('cuts a long comment to 120 characters, ellipsis included', () => {
		const excerpt = commentExcerpt('a'.repeat(300))

		expect(excerpt).toHaveLength(120)
		expect(excerpt.endsWith('…')).toBe(true)
	})

	it('leaves a comment of exactly 120 characters untouched', () => {
		expect(commentExcerpt('a'.repeat(120))).toBe('a'.repeat(120))
	})
})
