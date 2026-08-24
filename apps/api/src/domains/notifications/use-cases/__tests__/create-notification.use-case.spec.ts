import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	buildNotification,
	buildRepository,
} from '../../__tests__/notification.fixture'
import type { NotificationRepository } from '../../repository/notification.repository'
import { CreateNotificationUseCase } from '../create-notification.use-case'

describe('CreateNotificationUseCase', () => {
	let repository: NotificationRepository
	let useCase: CreateNotificationUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new CreateNotificationUseCase(repository)
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
