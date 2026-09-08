import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildRepository } from '../../__tests__/notification.fixture'
import type { NotificationRepository } from '../../repository/notification.repository'
import { GetUnreadNotificationsCountUseCase } from '../get-unread-notifications-count.use-case'
const VISITOR = { audience: 'user', userId: 'user-1' } as const
const DESK = { audience: 'admin' } as const

describe('GetUnreadNotificationsCountUseCase', () => {
	let repository: NotificationRepository
	let useCase: GetUnreadNotificationsCountUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new GetUnreadNotificationsCountUseCase(repository)
	})

	// Both front-ends read this as a bare number; the admin badge silently
	// stayed hidden for a while because it expected `{ count }`.
	it.each([VISITOR, DESK])('answers the bare count for %j', async scope => {
		vi.mocked(repository.countUnread).mockResolvedValue(3)

		expect(await useCase.execute(scope)).toBe(3)
		expect(repository.countUnread).toHaveBeenCalledWith(scope)
	})

	it('answers zero rather than nothing when there is none', async () => {
		vi.mocked(repository.countUnread).mockResolvedValue(0)

		expect(await useCase.execute(VISITOR)).toBe(0)
	})

	// The desk's count must never fold in the administrator's own notifications:
	// the scope it hands down carries no user at all.
	it('counts the desk without naming any owner', async () => {
		vi.mocked(repository.countUnread).mockResolvedValue(1)

		await useCase.execute(DESK)

		expect(repository.countUnread).toHaveBeenCalledWith({ audience: 'admin' })
	})
})
