import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildRepository } from '../../__tests__/notification.fixture'
import type { NotificationRepository } from '../../repository/notification.repository'
import { MarkAllNotificationsAsReadUseCase } from '../mark-all-notifications-as-read.use-case'
const VISITOR = { audience: 'user', userId: 'user-1' } as const
const DESK = { audience: 'admin' } as const

describe('MarkAllNotificationsAsReadUseCase', () => {
	let repository: NotificationRepository
	let useCase: MarkAllNotificationsAsReadUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new MarkAllNotificationsAsReadUseCase(repository)
	})

	it.each([VISITOR, DESK])('marks all the notifications in %j', async scope => {
		vi.mocked(repository.markAllAsRead).mockResolvedValue(undefined)

		await useCase.execute(scope)

		expect(repository.markAllAsRead).toHaveBeenCalledWith(scope)
	})
})
