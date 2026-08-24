import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ContactMessageNotFoundError } from '../../errors/contact-message.errors'
import type { ContactMessageRepository } from '../../repository/contact-message.repository'
import {
	buildContactMessage,
	buildRepository,
} from '../../__tests__/contact-message.fixture'
import { GetContactMessageUseCase } from '../get-contact-message.use-case'

describe('GetContactMessageUseCase', () => {
	let repository: ContactMessageRepository
	let useCase: GetContactMessageUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new GetContactMessageUseCase(repository)
	})

	it('marks a new message as read and returns the updated one', async () => {
		const updated = buildContactMessage({
			status: 'read',
			readAt: new Date('2026-01-02'),
		})
		vi.mocked(repository.findById).mockResolvedValue(
			buildContactMessage({ status: 'new' }),
		)
		vi.mocked(repository.updateStatus).mockResolvedValue(updated)

		const result = await useCase.execute('message-1')

		expect(repository.updateStatus).toHaveBeenCalledWith('message-1', 'read')
		expect(result).toEqual(updated)
	})

	/** `readAt` must keep the first read, not the latest. */
	it.each(['read', 'archived'] as const)(
		'leaves a %s message untouched',
		async status => {
			const message = buildContactMessage({ status })
			vi.mocked(repository.findById).mockResolvedValue(message)

			const result = await useCase.execute('message-1')

			expect(repository.updateStatus).not.toHaveBeenCalled()
			expect(result).toEqual(message)
		},
	)

	it('throws when the message does not exist', async () => {
		vi.mocked(repository.findById).mockResolvedValue(null)

		await expect(useCase.execute('missing')).rejects.toThrow(
			ContactMessageNotFoundError,
		)
		expect(repository.updateStatus).not.toHaveBeenCalled()
	})
})
