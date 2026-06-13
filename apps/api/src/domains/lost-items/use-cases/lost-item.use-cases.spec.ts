import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	LostItemForbiddenError,
	LostItemNotFoundError,
} from '../errors/lost-item.errors'
import type { LostItem } from '../models/lost-item.model'
import type { LostItemRepository } from '../repository/lost-item.repository'
import type { CreateLostItemData } from '../types/lost-item.types'
import { LostItemUseCases } from './lost-item.use-cases'

function buildLostItem(overrides: Partial<LostItem> = {}): LostItem {
	return {
		id: 'lost-item-1',
		type: 'lost',
		category: 'phone',
		title: 'iPhone 13 perdu',
		description: 'Perdu près du marché de Cocody, coque noire avec autocollant',
		ville: 'Abidjan',
		commune: 'Cocody',
		eventDate: new Date('2026-01-01'),
		contactName: 'Jean Dupont',
		contactWhatsapp: '+2250700000000',
		photos: [],
		moderationStatus: 'pending',
		resolutionStatus: 'active',
		views: 0,
		contactsCount: 0,
		userId: 'user-1',
		createdAt: new Date('2026-01-01'),
		updatedAt: new Date('2026-01-01'),
		...overrides,
	}
}

function buildRepository(): LostItemRepository {
	return {
		create: vi.fn(),
		findById: vi.fn(),
		list: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
		incrementViews: vi.fn(),
		incrementContacts: vi.fn(),
	}
}

describe('LostItemUseCases', () => {
	let repository: LostItemRepository
	let useCases: LostItemUseCases

	beforeEach(() => {
		repository = buildRepository()
		useCases = new LostItemUseCases(repository)
	})

	describe('create', () => {
		const data: CreateLostItemData = {
			type: 'lost',
			category: 'phone',
			title: 'iPhone 13 perdu',
			description:
				'Perdu près du marché de Cocody, coque noire avec autocollant',
			ville: 'Abidjan',
			eventDate: new Date('2026-01-01'),
			contactName: 'Jean Dupont',
			contactWhatsapp: '+2250700000000',
			userId: 'user-1',
		}

		it('creates a lost item when data is valid', async () => {
			const created = buildLostItem()
			vi.mocked(repository.create).mockResolvedValue(created)

			const result = await useCases.create(data)

			expect(repository.create).toHaveBeenCalledWith(data)
			expect(result).toEqual(created)
		})

		it('throws when the data is invalid', async () => {
			await expect(
				useCases.create({ ...data, description: 'Trop court' }),
			).rejects.toThrow()
			expect(repository.create).not.toHaveBeenCalled()
		})
	})

	describe('getById', () => {
		it('returns the lost item when found', async () => {
			const lostItem = buildLostItem()
			vi.mocked(repository.findById).mockResolvedValue(lostItem)

			const result = await useCases.getById('lost-item-1')

			expect(result).toEqual(lostItem)
		})

		it('throws LostItemNotFoundError when the item does not exist', async () => {
			vi.mocked(repository.findById).mockResolvedValue(null)

			await expect(useCases.getById('missing')).rejects.toThrow(
				LostItemNotFoundError,
			)
		})
	})

	describe('view', () => {
		it('increments the view count and returns the updated lost item', async () => {
			const lostItem = buildLostItem({ views: 5 })
			vi.mocked(repository.findById).mockResolvedValue(lostItem)

			const result = await useCases.view('lost-item-1')

			expect(repository.incrementViews).toHaveBeenCalledWith('lost-item-1')
			expect(result).toEqual({ ...lostItem, views: 6 })
		})

		it('throws LostItemNotFoundError when the item does not exist', async () => {
			vi.mocked(repository.findById).mockResolvedValue(null)

			await expect(useCases.view('missing')).rejects.toThrow(
				LostItemNotFoundError,
			)
			expect(repository.incrementViews).not.toHaveBeenCalled()
		})
	})

	describe('recordContact', () => {
		it('increments the contacts count and returns the updated lost item', async () => {
			const lostItem = buildLostItem({ contactsCount: 2 })
			vi.mocked(repository.findById).mockResolvedValue(lostItem)

			const result = await useCases.recordContact('lost-item-1')

			expect(repository.incrementContacts).toHaveBeenCalledWith('lost-item-1')
			expect(result).toEqual({ ...lostItem, contactsCount: 3 })
		})

		it('throws LostItemNotFoundError when the item does not exist', async () => {
			vi.mocked(repository.findById).mockResolvedValue(null)

			await expect(useCases.recordContact('missing')).rejects.toThrow(
				LostItemNotFoundError,
			)
			expect(repository.incrementContacts).not.toHaveBeenCalled()
		})
	})

	describe('list', () => {
		it('delegates to the repository', async () => {
			const response = {
				items: [buildLostItem()],
				total: 1,
				page: 1,
				pageSize: 20,
			}
			vi.mocked(repository.list).mockResolvedValue(response)

			const filter = { page: 1, pageSize: 20 }
			const result = await useCases.list(filter)

			expect(repository.list).toHaveBeenCalledWith(filter)
			expect(result).toEqual(response)
		})

		it('forwards the search filter to the repository', async () => {
			const response = {
				items: [buildLostItem()],
				total: 1,
				page: 1,
				pageSize: 20,
			}
			vi.mocked(repository.list).mockResolvedValue(response)

			const filter = { page: 1, pageSize: 20, search: 'iPhone' }
			await useCases.list(filter)

			expect(repository.list).toHaveBeenCalledWith(filter)
		})
	})

	describe('listMine', () => {
		it('delegates to the repository with the user id injected', async () => {
			const response = {
				items: [buildLostItem({ userId: 'user-1' })],
				total: 1,
				page: 1,
				pageSize: 20,
			}
			vi.mocked(repository.list).mockResolvedValue(response)

			const filter = { page: 1, pageSize: 20 }
			const result = await useCases.listMine('user-1', filter)

			expect(repository.list).toHaveBeenCalledWith({
				...filter,
				userId: 'user-1',
			})
			expect(result).toEqual(response)
		})
	})

	describe('update', () => {
		it('updates the lost item when the user is the owner', async () => {
			const lostItem = buildLostItem({ userId: 'user-1' })
			const updated = buildLostItem({
				userId: 'user-1',
				title: 'Nouveau titre',
			})

			vi.mocked(repository.findById).mockResolvedValue(lostItem)
			vi.mocked(repository.update).mockResolvedValue(updated)

			const result = await useCases.update('lost-item-1', 'user-1', {
				title: 'Nouveau titre',
			})

			expect(repository.update).toHaveBeenCalledWith('lost-item-1', {
				title: 'Nouveau titre',
			})
			expect(result).toEqual(updated)
		})

		it('throws LostItemForbiddenError when the user is not the owner', async () => {
			const lostItem = buildLostItem({ userId: 'user-1' })
			vi.mocked(repository.findById).mockResolvedValue(lostItem)

			await expect(
				useCases.update('lost-item-1', 'user-2', { title: 'Nouveau titre' }),
			).rejects.toThrow(LostItemForbiddenError)
			expect(repository.update).not.toHaveBeenCalled()
		})

		it('throws when the update data is invalid', async () => {
			await expect(
				useCases.update('lost-item-1', 'user-1', { description: 'Trop court' }),
			).rejects.toThrow()
			expect(repository.findById).not.toHaveBeenCalled()
		})

		it('throws LostItemNotFoundError when the item does not exist', async () => {
			vi.mocked(repository.findById).mockResolvedValue(null)

			await expect(
				useCases.update('missing', 'user-1', { title: 'Nouveau titre' }),
			).rejects.toThrow(LostItemNotFoundError)
		})
	})

	describe('delete', () => {
		it('deletes the lost item when the user is the owner', async () => {
			const lostItem = buildLostItem({ userId: 'user-1' })
			vi.mocked(repository.findById).mockResolvedValue(lostItem)

			await useCases.delete('lost-item-1', 'user-1')

			expect(repository.delete).toHaveBeenCalledWith('lost-item-1')
		})

		it('throws LostItemForbiddenError when the user is not the owner', async () => {
			const lostItem = buildLostItem({ userId: 'user-1' })
			vi.mocked(repository.findById).mockResolvedValue(lostItem)

			await expect(useCases.delete('lost-item-1', 'user-2')).rejects.toThrow(
				LostItemForbiddenError,
			)
			expect(repository.delete).not.toHaveBeenCalled()
		})

		it('throws LostItemNotFoundError when the item does not exist', async () => {
			vi.mocked(repository.findById).mockResolvedValue(null)

			await expect(useCases.delete('missing', 'user-1')).rejects.toThrow(
				LostItemNotFoundError,
			)
		})
	})
})
