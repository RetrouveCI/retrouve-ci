import { describe, expect, it } from 'vitest'
import { InvalidLostItemError } from '../errors/lost-item.errors'
import type {
	CreateLostItemData,
	UpdateLostItemData,
} from '../types/lost-item.types'
import { validateCreateLostItem, validateUpdateLostItem } from './lost-item.validator'

const baseCreateData: CreateLostItemData = {
	type: 'lost',
	category: 'phone',
	title: 'iPhone 13 perdu',
	description: 'Perdu près du marché de Cocody, coque noire avec autocollant',
	ville: 'Abidjan',
	eventDate: new Date('2026-01-01'),
	contactName: 'Jean Dupont',
	contactWhatsapp: '+2250700000000',
	userId: 'user-1',
}

describe('validateCreateLostItem', () => {
	it('does not throw for valid data', () => {
		expect(() => validateCreateLostItem(baseCreateData)).not.toThrow()
	})

	it('throws when description is too short', () => {
		expect(() =>
			validateCreateLostItem({ ...baseCreateData, description: 'Trop court' }),
		).toThrow(InvalidLostItemError)
	})

	it('throws when there are too many photos', () => {
		expect(() =>
			validateCreateLostItem({
				...baseCreateData,
				photos: ['a', 'b', 'c', 'd', 'e', 'f'],
			}),
		).toThrow(InvalidLostItemError)
	})
})

describe('validateUpdateLostItem', () => {
	it('does not throw for an empty update', () => {
		const data: UpdateLostItemData = {}

		expect(() => validateUpdateLostItem(data)).not.toThrow()
	})

	it('throws when the updated description is too short', () => {
		expect(() =>
			validateUpdateLostItem({ description: 'Trop court' }),
		).toThrow(InvalidLostItemError)
	})

	it('throws when there are too many photos', () => {
		expect(() =>
			validateUpdateLostItem({ photos: ['a', 'b', 'c', 'd', 'e', 'f'] }),
		).toThrow(InvalidLostItemError)
	})
})
