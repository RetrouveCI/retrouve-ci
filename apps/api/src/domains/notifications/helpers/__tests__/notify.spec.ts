import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Logger } from '@nestjs/common'
import type { CreateNotificationUseCase } from '../../use-cases/create-notification.use-case'
import { notifyDesk, notifyUser } from '../notify'

describe('notify', () => {
	let createNotification: CreateNotificationUseCase
	let logger: Logger

	beforeEach(() => {
		createNotification = {
			execute: vi.fn().mockResolvedValue(undefined),
		} as unknown as CreateNotificationUseCase
		logger = { error: vi.fn() } as unknown as Logger
	})

	const content = { title: 'Titre', message: 'Message', link: '/x' }

	it('raises a desk notice with no owner', async () => {
		await notifyDesk(createNotification, logger, {
			...content,
			type: 'listing_pending',
		})

		expect(createNotification.execute).toHaveBeenCalledWith({
			...content,
			type: 'listing_pending',
		})
		expect(logger.error).not.toHaveBeenCalled()
	})

	it('raises a visitor notice for its owner', async () => {
		await notifyUser(createNotification, logger, {
			...content,
			type: 'listing_moderated',
			userId: 'user-1',
		})

		expect(createNotification.execute).toHaveBeenCalledWith({
			...content,
			type: 'listing_moderated',
			userId: 'user-1',
		})
	})

	// The row the notice speaks about already exists: a failing notice must not
	// answer 500. Both façades share one body, so both are asserted.
	it.each([
		[
			'notifyDesk',
			() =>
				notifyDesk(createNotification, logger, {
					...content,
					type: 'order_placed',
				}),
		],
		[
			'notifyUser',
			() =>
				notifyUser(createNotification, logger, {
					...content,
					type: 'listing_contacted',
					userId: 'user-1',
				}),
		],
	] as const)('swallows a failure from %s and logs it', async (_name, call) => {
		vi.mocked(createNotification.execute).mockRejectedValue(
			new Error('redis down'),
		)

		await expect(call()).resolves.toBeUndefined()
		expect(logger.error).toHaveBeenCalledTimes(1)
		expect(vi.mocked(logger.error).mock.calls[0]?.[0]).toContain('redis down')
	})
})
