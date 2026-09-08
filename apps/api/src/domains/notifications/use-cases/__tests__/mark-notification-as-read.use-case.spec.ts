import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	buildDeskNotification,
	buildNotification,
	buildRepository,
} from '../../__tests__/notification.fixture'
import { NotificationNotFoundError } from '../../errors/notification.errors'
import type { NotificationRepository } from '../../repository/notification.repository'
import { MarkNotificationAsReadUseCase } from '../mark-notification-as-read.use-case'

const VISITOR = { audience: 'user', userId: 'user-1' } as const
const DESK = { audience: 'admin' } as const

describe('MarkNotificationAsReadUseCase', () => {
	let repository: NotificationRepository
	let useCase: MarkNotificationAsReadUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new MarkNotificationAsReadUseCase(repository)
	})

	it('marks the notification as read when it is in scope', async () => {
		const read = buildNotification({ read: true, readAt: new Date() })
		vi.mocked(repository.findInScope).mockResolvedValue(buildNotification())
		vi.mocked(repository.markAsRead).mockResolvedValue(read)

		const result = await useCase.execute({
			id: 'notification-1',
			scope: VISITOR,
		})

		expect(repository.markAsRead).toHaveBeenCalledWith('notification-1')
		expect(result).toEqual(read)
	})

	// The scope travels into the query, so the lookup cannot come back with a row
	// from the other audience for the use-case to have to reject.
	it.each([VISITOR, DESK])('asks only within %j', async scope => {
		vi.mocked(repository.findInScope).mockResolvedValue(buildNotification())
		vi.mocked(repository.markAsRead).mockResolvedValue(buildNotification())

		await useCase.execute({ id: 'notification-1', scope })

		expect(repository.findInScope).toHaveBeenCalledWith('notification-1', scope)
	})

	it('marks a desk notification, which belongs to nobody', async () => {
		const read = buildDeskNotification({ read: true, readAt: new Date() })
		vi.mocked(repository.findInScope).mockResolvedValue(buildDeskNotification())
		vi.mocked(repository.markAsRead).mockResolvedValue(read)

		expect(
			await useCase.execute({ id: 'notification-desk-1', scope: DESK }),
		).toEqual(read)
	})

	/**
	 * Out of scope answers "not found", not "forbidden" — telling a caller an id
	 * exists but is not theirs leaks more than it helps. The repository returns
	 * nothing for a row in the other audience, which is the same path.
	 */
	it.each([VISITOR, DESK])(
		'refuses what %j cannot see, without writing',
		async scope => {
			vi.mocked(repository.findInScope).mockResolvedValue(null)

			await expect(useCase.execute({ id: 'missing', scope })).rejects.toThrow(
				NotificationNotFoundError,
			)
			expect(repository.markAsRead).not.toHaveBeenCalled()
		},
	)

	it('writes nothing when it is already read', async () => {
		const already = buildDeskNotification({ read: true, readAt: new Date() })
		vi.mocked(repository.findInScope).mockResolvedValue(already)

		expect(await useCase.execute({ id: already.id, scope: DESK })).toEqual(
			already,
		)
		expect(repository.markAsRead).not.toHaveBeenCalled()
	})
})
