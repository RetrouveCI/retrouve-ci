import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ContactMessageRepository } from '../../repository/contact-message.repository'
import {
	buildContactMessage,
	buildRepository,
} from '../../__tests__/contact-message.fixture'
import { GetPaginatedContactMessagesUseCase } from '../get-paginated-contact-messages.use-case'

describe('GetPaginatedContactMessagesUseCase', () => {
	let repository: ContactMessageRepository
	let useCase: GetPaginatedContactMessagesUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new GetPaginatedContactMessagesUseCase(repository)
	})

	it('hands the filter to the repository and returns its page', async () => {
		const response = {
			items: [buildContactMessage()],
			total: 1,
			page: 1,
			pageSize: 20,
		}
		vi.mocked(repository.list).mockResolvedValue(response)

		const result = await useCase.execute({ page: 1, pageSize: 20 })

		expect(repository.list).toHaveBeenCalledWith({ page: 1, pageSize: 20 })
		expect(result).toEqual(response)
	})

	it('carries a status filter through', async () => {
		const response = { items: [], total: 0, page: 2, pageSize: 10 }
		vi.mocked(repository.list).mockResolvedValue(response)

		await useCase.execute({ page: 2, pageSize: 10, status: 'archived' })

		expect(repository.list).toHaveBeenCalledWith({
			page: 2,
			pageSize: 10,
			status: 'archived',
		})
	})
})
