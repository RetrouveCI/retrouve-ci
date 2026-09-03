import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	buildLostItem,
	buildPublicLostItem,
	buildRepository,
} from '../../__tests__/lost-item.fixture'
import { LostItemNotFoundError } from '../../errors/lost-item.errors'
import type { LostItemRepository } from '../../repository/lost-item.repository'
import { RecordLostItemContactUseCase } from '../record-lost-item-contact.use-case'

describe('RecordLostItemContactUseCase', () => {
	let repository: LostItemRepository
	let useCase: RecordLostItemContactUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new RecordLostItemContactUseCase(repository)
	})

	it('increments the contacts count and returns the updated lost item', async () => {
		const lostItem = buildLostItem({
			moderationStatus: 'published',
			contactsCount: 2,
		})
		vi.mocked(repository.findById).mockResolvedValue(lostItem)

		const result = await useCase.execute('lost-item-1')

		expect(repository.incrementContacts).toHaveBeenCalledWith('lost-item-1')
		expect(result).toEqual(
			buildPublicLostItem({ moderationStatus: 'published', contactsCount: 3 }),
		)
	})

	// Four routes answer to nobody in particular; this is one of them.
	it('never carries the document number', async () => {
		vi.mocked(repository.findById).mockResolvedValue(
			buildLostItem({
				documentType: 'national_id',
				documentHolderName: 'KOUASSI Jean',
				documentNumber: 'CI0012345678',
			}),
		)

		const result = await useCase.execute('lost-item-1')

		expect(result).not.toHaveProperty('documentNumber')
		expect(result.documentHolderName).toBe('KOUASSI Jean')
	})

	it('throws when the item does not exist, without counting a contact', async () => {
		vi.mocked(repository.findById).mockResolvedValue(null)

		await expect(useCase.execute('missing')).rejects.toThrow(
			LostItemNotFoundError,
		)
		expect(repository.incrementContacts).not.toHaveBeenCalled()
	})

	it('throws when the item is not published, without counting a contact', async () => {
		vi.mocked(repository.findById).mockResolvedValue(
			buildLostItem({ moderationStatus: 'hidden' }),
		)

		await expect(useCase.execute('lost-item-1')).rejects.toThrow(
			LostItemNotFoundError,
		)
		expect(repository.incrementContacts).not.toHaveBeenCalled()
	})
})
