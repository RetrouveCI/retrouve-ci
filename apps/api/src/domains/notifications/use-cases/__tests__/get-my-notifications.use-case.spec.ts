import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	buildDeskNotification,
	buildNotification,
	buildRepository,
} from '../../__tests__/notification.fixture'
import type { NotificationRepository } from '../../repository/notification.repository'
import { GetMyNotificationsUseCase } from '../get-my-notifications.use-case'

const VISITOR = { audience: 'user', userId: 'user-1' } as const
const DESK = { audience: 'admin' } as const
const PAGE = { page: 1, pageSize: 20 }

describe('GetMyNotificationsUseCase', () => {
	let repository: NotificationRepository
	let useCase: GetMyNotificationsUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new GetMyNotificationsUseCase(repository)
		vi.mocked(repository.list).mockResolvedValue({
			items: [],
			total: 0,
			...PAGE,
		})
	})

	it("scopes the listing to the visitor's own", async () => {
		const response = { items: [buildNotification()], total: 1, ...PAGE }
		vi.mocked(repository.list).mockResolvedValue(response)

		const result = await useCase.execute({ scope: VISITOR, filter: PAGE })

		expect(repository.list).toHaveBeenCalledWith({ ...PAGE, scope: VISITOR })
		expect(result).toEqual(response)
	})

	it("scopes the listing to the desk's, which belong to nobody", async () => {
		const response = { items: [buildDeskNotification()], total: 1, ...PAGE }
		vi.mocked(repository.list).mockResolvedValue(response)

		const result = await useCase.execute({ scope: DESK, filter: PAGE })

		expect(repository.list).toHaveBeenCalledWith({ ...PAGE, scope: DESK })
		expect(result).toEqual(response)
	})

	// The scope is applied last, so a filter claiming the other audience cannot
	// widen it. It used to be a `userId` smuggled in; it is a `scope` now.
	it('overrides a scope smuggled in through the filter', async () => {
		await useCase.execute({
			scope: VISITOR,
			filter: { ...PAGE, scope: DESK } as never,
		})

		const [call] = vi.mocked(repository.list).mock.calls

		expect(call?.[0]?.scope).toEqual(VISITOR)
	})

	it('carries the read filter through', async () => {
		await useCase.execute({ scope: VISITOR, filter: { ...PAGE, read: false } })

		expect(repository.list).toHaveBeenCalledWith({
			...PAGE,
			read: false,
			scope: VISITOR,
		})
	})
})
