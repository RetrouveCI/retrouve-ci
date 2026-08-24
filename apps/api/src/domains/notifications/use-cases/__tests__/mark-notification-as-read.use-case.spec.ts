import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	buildNotification,
	buildRepository,
} from '../../__tests__/notification.fixture'
import { NotificationNotFoundError } from '../../errors/notification.errors'
import type { NotificationRepository } from '../../repository/notification.repository'
import { MarkNotificationAsReadUseCase } from '../mark-notification-as-read.use-case'

describe('MarkNotificationAsReadUseCase', () => {
	let repository: NotificationRepository
	let useCase: MarkNotificationAsReadUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new MarkNotificationAsReadUseCase(repository)
	})

	it('marks the notification as read when it belongs to the user', async () => {
		const read = buildNotification({ read: true, readAt: new Date() })
		vi.mocked(repository.findById).mockResolvedValue(buildNotification())
		vi.mocked(repository.markAsRead).mockResolvedValue(read)

		const result = await useCase.execute({
			id: 'notification-1',
			userId: 'user-1',
		})

		expect(repository.markAsRead).toHaveBeenCalledWith('notification-1')
		expect(result).toEqual(read)
	})

	it('throws when the notification does not exist', async () => {
		vi.mocked(repository.findById).mockResolvedValue(null)

		await expect(
			useCase.execute({ id: 'missing', userId: 'user-1' }),
		).rejects.toThrow(NotificationNotFoundError)
		expect(repository.markAsRead).not.toHaveBeenCalled()
	})

	/**
	 * Someone else's notification answers "not found", not "forbidden" — telling a
	 * caller an id exists but is not theirs leaks more than it helps. This is the
	 * scoping check, so it is asserted rather than assumed.
	 */
	it('refuses a notification belonging to another user, without writing', async () => {
		vi.mocked(repository.findById).mockResolvedValue(
			buildNotification({ userId: 'someone-else' }),
		)

		await expect(
			useCase.execute({ id: 'notification-1', userId: 'user-1' }),
		).rejects.toThrow(NotificationNotFoundError)
		expect(repository.markAsRead).not.toHaveBeenCalled()
	})
})
