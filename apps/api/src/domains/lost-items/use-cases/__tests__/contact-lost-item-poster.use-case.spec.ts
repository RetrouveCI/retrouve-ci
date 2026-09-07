import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	buildLostItem,
	buildRepository,
} from '../../__tests__/lost-item.fixture'
import {
	LostItemNotFoundError,
	LostItemUnreachableError,
} from '../../errors/lost-item.errors'
import type { LostItemRepository } from '../../repository/lost-item.repository'
import { ContactLostItemPosterUseCase } from '../contact-lost-item-poster.use-case'

describe('ContactLostItemPosterUseCase', () => {
	let repository: LostItemRepository
	let useCase: ContactLostItemPosterUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new ContactLostItemPosterUseCase(repository)
	})

	const published = (over: Record<string, unknown> = {}) =>
		buildLostItem({ moderationStatus: 'published', ...over })

	it('answers the target and counts the contact', async () => {
		vi.mocked(repository.findById).mockResolvedValue(
			published({ contactWhatsapp: '+2250700000000' }),
		)

		const { url } = await useCase.execute('lost-item-1')

		expect(url).toContain('https://wa.me/2250700000000?text=')
		expect(repository.incrementContacts).toHaveBeenCalledWith('lost-item-1')
	})

	it.each([
		['lost', 'trouvé votre objet'],
		['found', 'est peut-être le mien'],
	] as const)(
		'prefills a %s listing from the finder’s side',
		async (type, sentence) => {
			vi.mocked(repository.findById).mockResolvedValue(
				published({ type, title: 'Sac à dos noir' }),
			)

			const { url } = await useCase.execute('lost-item-1')

			expect(decodeURIComponent(url)).toContain(sentence)
			expect(decodeURIComponent(url)).toContain('« Sac à dos noir »')
		},
	)

	// R10's fourth state, decided by the API now that the number stays there.
	it('refuses a number the gateway could never reach, counting nothing', async () => {
		vi.mocked(repository.findById).mockResolvedValue(
			published({ contactWhatsapp: '070000000' }),
		)

		await expect(useCase.execute('lost-item-1')).rejects.toBeInstanceOf(
			LostItemUnreachableError,
		)
		expect(repository.incrementContacts).not.toHaveBeenCalled()
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
