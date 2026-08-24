import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	buildNotification,
	buildRepository,
} from '../../__tests__/notification.fixture'
import type { NotificationRepository } from '../../repository/notification.repository'
import { GetMyNotificationsUseCase } from '../get-my-notifications.use-case'

describe('GetMyNotificationsUseCase', () => {
	let repository: NotificationRepository
	let useCase: GetMyNotificationsUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new GetMyNotificationsUseCase(repository)
	})

	it('scopes the listing to the given user', async () => {
		const response = {
			items: [buildNotification()],
			total: 1,
			page: 1,
			pageSize: 20,
		}
		vi.mocked(repository.list).mockResolvedValue(response)

		const result = await useCase.execute({
			userId: 'user-1',
			filter: { page: 1, pageSize: 20 },
		})

		expect(repository.list).toHaveBeenCalledWith({
			page: 1,
			pageSize: 20,
			userId: 'user-1',
		})
		expect(result).toEqual(response)
	})

	/**
	 * The session's user id is applied last, so a filter carrying someone else's
	 * id cannot widen the scope.
	 */
	it('overrides a userId smuggled in through the filter', async () => {
		vi.mocked(repository.list).mockResolvedValue({
			items: [],
			total: 0,
			page: 1,
			pageSize: 20,
		})

		await useCase.execute({
			userId: 'user-1',
			filter: { page: 1, pageSize: 20, userId: 'someone-else' } as never,
		})

		const [call] = vi.mocked(repository.list).mock.calls
		expect(call?.[0]?.userId).toBe('user-1')
	})

	it('carries the read filter through', async () => {
		vi.mocked(repository.list).mockResolvedValue({
			items: [],
			total: 0,
			page: 1,
			pageSize: 20,
		})

		await useCase.execute({
			userId: 'user-1',
			filter: { page: 1, pageSize: 20, read: false },
		})

		expect(repository.list).toHaveBeenCalledWith({
			page: 1,
			pageSize: 20,
			read: false,
			userId: 'user-1',
		})
	})
})
