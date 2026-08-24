import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildRepository } from '../../__tests__/notification.fixture'
import type { NotificationRepository } from '../../repository/notification.repository'
import { MarkAllNotificationsAsReadUseCase } from '../mark-all-notifications-as-read.use-case'

describe('MarkAllNotificationsAsReadUseCase', () => {
	let repository: NotificationRepository
	let useCase: MarkAllNotificationsAsReadUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new MarkAllNotificationsAsReadUseCase(repository)
	})

	it("marks all of the given user's notifications", async () => {
		vi.mocked(repository.markAllAsRead).mockResolvedValue(undefined)

		await useCase.execute('user-1')

		expect(repository.markAllAsRead).toHaveBeenCalledWith('user-1')
	})
})
