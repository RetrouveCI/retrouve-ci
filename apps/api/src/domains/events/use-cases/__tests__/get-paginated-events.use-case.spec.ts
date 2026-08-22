import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildEvent, buildRepository } from '../../__tests__/event.fixture'
import type { EventRepository } from '../../repository/event.repository'
import { GetPaginatedEventsUseCase } from '../get-paginated-events.use-case'

describe('GetPaginatedEventsUseCase', () => {
	let repository: EventRepository
	let useCase: GetPaginatedEventsUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new GetPaginatedEventsUseCase(repository)
	})

	it('hands the filter through and returns the page', async () => {
		const response = {
			items: [buildEvent()],
			total: 1,
			page: 1,
			pageSize: 20,
		}
		vi.mocked(repository.list).mockResolvedValue(response)

		const result = await useCase.execute({ page: 1, pageSize: 20 })

		expect(repository.list).toHaveBeenCalledWith({ page: 1, pageSize: 20 })
		expect(result).toEqual(response)
	})

	// The public route forces `published`; the admin one passes its own status.
	it('carries whichever status the caller asked for', async () => {
		vi.mocked(repository.list).mockResolvedValue({
			items: [],
			total: 0,
			page: 1,
			pageSize: 20,
		})

		await useCase.execute({ page: 1, pageSize: 20, status: 'published' })

		expect(repository.list).toHaveBeenCalledWith({
			page: 1,
			pageSize: 20,
			status: 'published',
		})
	})
})
