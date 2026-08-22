import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ContactMessageNotFoundError } from '../../errors/contact-message.errors'
import type { ContactMessageRepository } from '../../repository/contact-message.repository'
import {
	buildContactMessage,
	buildRepository,
} from '../../__tests__/contact-message.fixture'
import { UpdateContactMessageStatusUseCase } from '../update-contact-message-status.use-case'

describe('UpdateContactMessageStatusUseCase', () => {
	let repository: ContactMessageRepository
	let useCase: UpdateContactMessageStatusUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new UpdateContactMessageStatusUseCase(repository)
	})

	it('updates the status after checking existence', async () => {
		const archived = buildContactMessage({ status: 'archived' })
		vi.mocked(repository.findById).mockResolvedValue(
			buildContactMessage({ status: 'new' }),
		)
		vi.mocked(repository.updateStatus).mockResolvedValue(archived)

		const result = await useCase.execute({
			id: 'message-1',
			status: 'archived',
		})

		expect(repository.updateStatus).toHaveBeenCalledWith(
			'message-1',
			'archived',
		)
		expect(result).toEqual(archived)
	})

	it('throws when the message does not exist, without writing', async () => {
		vi.mocked(repository.findById).mockResolvedValue(null)

		await expect(
			useCase.execute({ id: 'missing', status: 'archived' }),
		).rejects.toThrow(ContactMessageNotFoundError)
		expect(repository.updateStatus).not.toHaveBeenCalled()
	})
})
