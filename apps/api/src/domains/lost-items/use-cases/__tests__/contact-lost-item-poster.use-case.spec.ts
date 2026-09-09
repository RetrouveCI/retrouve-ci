import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	buildLostItem,
	buildRepository,
} from '../../__tests__/lost-item.fixture'
import {
	LostItemNotFoundError,
	LostItemUnreachableError,
} from '../../errors/lost-item.errors'
import { CreateNotificationUseCase } from '@/domains/notifications/use-cases/create-notification.use-case'
import type { LostItemRepository } from '../../repository/lost-item.repository'
import { ContactLostItemPosterUseCase } from '../contact-lost-item-poster.use-case'

describe('ContactLostItemPosterUseCase', () => {
	let repository: LostItemRepository
	let notifier: CreateNotificationUseCase
	let useCase: ContactLostItemPosterUseCase

	beforeEach(() => {
		repository = buildRepository()
		notifier = {
			execute: vi.fn().mockResolvedValue(undefined),
		} as unknown as CreateNotificationUseCase
		useCase = new ContactLostItemPosterUseCase(repository, notifier)
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
		expect(notifier.execute).not.toHaveBeenCalled()
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

	// What the step adds over `contactsCount`: a trace of who was sent and when,
	// where the count is only a number.
	describe('telling the poster', () => {
		const notice = () => vi.mocked(notifier.execute).mock.calls[0]?.[0]

		it('addresses the owner and names the listing', async () => {
			vi.mocked(repository.findById).mockResolvedValue(
				published({ title: 'Sac à dos noir', userId: 'user-7' }),
			)

			await useCase.execute('lost-item-1')

			expect(notice()).toEqual(
				expect.objectContaining({
					type: 'listing_contacted',
					userId: 'user-7',
					link: '/account/posts',
				}),
			)
			expect(notice()?.message).toContain('« Sac à dos noir »')
		})

		// Read from the poster's side, where the WhatsApp text is read from the
		// other: a lost item was found, a found one is claimed.
		it.each([
			['lost', 'pense avoir trouvé'],
			['found', 'lui appartient'],
		] as const)(
			'words a %s listing from the poster’s side',
			async (type, sentence) => {
				vi.mocked(repository.findById).mockResolvedValue(published({ type }))

				await useCase.execute('lost-item-1')

				expect(notice()?.message).toContain(sentence)
			},
		)

		// The count is already written by then: losing the notice must not answer
		// 500 to the finder who is being sent to WhatsApp.
		it('still answers the target when the notice fails', async () => {
			vi.mocked(repository.findById).mockResolvedValue(published())
			vi.mocked(notifier.execute).mockRejectedValue(new Error('redis down'))

			await expect(useCase.execute('lost-item-1')).resolves.toHaveProperty(
				'url',
			)
		})
	})
})
