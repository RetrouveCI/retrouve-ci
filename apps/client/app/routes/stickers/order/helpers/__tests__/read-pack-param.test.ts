import { describe, expect, it } from 'vitest'
import { readPackParam } from '../read-pack-param'

describe('readPackParam', () => {
	it('keeps a pack the catalogue sells', () => {
		expect(readPackParam('pack-8')).toBe('pack-8')
	})

	it('drops a pack the catalogue does not carry', () => {
		expect(readPackParam('pack-99')).toBe('')
	})

	it('drops an absent parameter', () => {
		expect(readPackParam(null)).toBe('')
	})

	it('does not resolve a property borrowed from Object', () => {
		expect(readPackParam('toString')).toBe('')
	})
})
