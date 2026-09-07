import { LOST_ITEM_CATEGORIES } from '@app/contracts/lost-items'
import { OBJECT_TYPES } from '../publish.const'

describe('the category pills', () => {
	it('leads with Documents', () => {
		expect(OBJECT_TYPES[0]).toEqual({ value: 'documents', label: 'Documents' })
	})

	it('draws every category the contract owns, exactly once', () => {
		const drawn = OBJECT_TYPES.map(type => type.value)

		expect(drawn).toHaveLength(LOST_ITEM_CATEGORIES.length)
		expect([...drawn].sort()).toEqual([...LOST_ITEM_CATEGORIES].sort())
	})

	it("keeps the contract's own order behind Documents", () => {
		expect(OBJECT_TYPES.slice(1).map(type => type.value)).toEqual(
			LOST_ITEM_CATEGORIES.filter(value => value !== 'documents'),
		)
	})

	it('names every pill', () => {
		for (const type of OBJECT_TYPES) {
			expect(type.label, type.value).toBeTruthy()
		}
	})
})
