import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	buildNotification,
	buildRepository,
} from '../../__tests__/notification.fixture'
import type { NotificationRepository } from '../../repository/notification.repository'
import type { PushToSubscribersUseCase } from '../push-to-subscribers.use-case'
import { CreateNotificationUseCase } from '../create-notification.use-case'

describe('CreateNotificationUseCase', () => {
	let repository: NotificationRepository
	let pushToSubscribers: PushToSubscribersUseCase
	let useCase: CreateNotificationUseCase

	beforeEach(() => {
		repository = buildRepository()
		pushToSubscribers = {
			execute: vi.fn().mockResolvedValue(undefined),
		} as unknown as PushToSubscribersUseCase
		useCase = new CreateNotificationUseCase(repository, pushToSubscribers)
	})

	it.each(['match_found', 'qr_scan'] as const)(
		'raises a %s notification',
		async type => {
			const created = buildNotification({ type })
			vi.mocked(repository.create).mockResolvedValue(created)

			const data = {
				type,
				title: 'Titre',
				message: 'Message',
				userId: 'user-1',
			}

			expect(await useCase.execute(data)).toEqual(created)
			expect(repository.create).toHaveBeenCalledWith(data)
		},
	)

	describe('the push that follows', () => {
		it('carries what a device needs to show', async () => {
			vi.mocked(repository.create).mockResolvedValue(buildNotification())

			await useCase.execute({
				type: 'match_found',
				title: 'Correspondance trouvée',
				message: 'Une annonce correspond.',
				link: '/posts/abc',
				userId: 'user-1',
			})

			expect(pushToSubscribers.execute).toHaveBeenCalledWith({
				userId: 'user-1',
				title: 'Correspondance trouvée',
				message: 'Une annonce correspond.',
				link: '/posts/abc',
			})
		})

		// An ADMIN row carries no `userId`, and a push is addressed to a person.
		it('pushes nothing for the desk', async () => {
			vi.mocked(repository.create).mockResolvedValue(buildNotification())

			await useCase.execute({
				type: 'listing_pending',
				title: 'T',
				message: 'M',
			})

			expect(pushToSubscribers.execute).not.toHaveBeenCalled()
		})

		/**
		 * ⚠️ The one that matters: `notify-matches` does not swallow, so BullMQ
		 * retries its job — and a retry re-creates the rows. A failing push must
		 * never reach that far.
		 */
		it('answers the row even when the push throws', async () => {
			const created = buildNotification()
			vi.mocked(repository.create).mockResolvedValue(created)
			vi.mocked(pushToSubscribers.execute).mockRejectedValue(
				new Error('redis down'),
			)

			expect(
				await useCase.execute({
					type: 'match_found',
					title: 'T',
					message: 'M',
					userId: 'user-1',
				}),
			).toEqual(created)
		})
	})

	it('passes an optional link through', async () => {
		vi.mocked(repository.create).mockResolvedValue(buildNotification())

		await useCase.execute({
			type: 'qr_scan',
			title: 'T',
			message: 'M',
			userId: 'user-1',
			link: '/account/stickers',
		})

		const [call] = vi.mocked(repository.create).mock.calls
		expect(call?.[0]?.link).toBe('/account/stickers')
	})
})
