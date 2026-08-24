import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	buildLostItem,
	buildRepository,
} from '../../__tests__/lost-item.fixture'
import type { LostItemRepository } from '../../repository/lost-item.repository'
import type { CreateLostItemData } from '../../types/lost-item.types'
import { CreateLostItemUseCase } from '../create-lost-item.use-case'

const data: CreateLostItemData = {
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

describe('CreateLostItemUseCase', () => {
	let repository: LostItemRepository
	let useCase: CreateLostItemUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new CreateLostItemUseCase(repository)
	})

	it('creates the lost item from the data it is given', async () => {
		const created = buildLostItem()
		vi.mocked(repository.create).mockResolvedValue(created)

		expect(await useCase.execute(data)).toEqual(created)
		expect(repository.create).toHaveBeenCalledWith(data)
	})
})
