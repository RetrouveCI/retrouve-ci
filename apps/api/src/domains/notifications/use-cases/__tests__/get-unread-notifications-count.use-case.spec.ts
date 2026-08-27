import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildRepository } from '../../__tests__/notification.fixture'
import type { NotificationRepository } from '../../repository/notification.repository'
import { GetUnreadNotificationsCountUseCase } from '../get-unread-notifications-count.use-case'

describe('GetUnreadNotificationsCountUseCase', () => {
	let repository: NotificationRepository
	let useCase: GetUnreadNotificationsCountUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new GetUnreadNotificationsCountUseCase(repository)
	})

	// Both front-ends read this as a bare number; the admin badge silently
	// stayed hidden for a while because it expected `{ count }`.
	it('answers the bare count for the given user', async () => {
		vi.mocked(repository.countUnread).mockResolvedValue(3)

		expect(await useCase.execute('user-1')).toBe(3)
		expect(repository.countUnread).toHaveBeenCalledWith('user-1')
	})

	it('answers zero rather than nothing when there is none', async () => {
		vi.mocked(repository.countUnread).mockResolvedValue(0)

		expect(await useCase.execute('user-1')).toBe(0)
	})
})
