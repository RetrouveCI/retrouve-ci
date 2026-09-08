import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { buildRepository } from '../../__tests__/lost-item.fixture'
import type { LostItemRepository } from '../../repository/lost-item.repository'
import { GetPublicCountersUseCase } from '../get-public-counters.use-case'

describe('GetPublicCountersUseCase', () => {
	let repository: LostItemRepository
	let useCase: GetPublicCountersUseCase

	beforeEach(() => {
		repository = buildRepository()
		vi.mocked(repository.countPublished).mockResolvedValue(412)
		vi.mocked(repository.countResolvedSince).mockResolvedValue(37)
		useCase = new GetPublicCountersUseCase(repository)
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('answers both figures', async () => {
		expect(await useCase.execute()).toEqual({
			published: 412,
			resolvedThisMonth: 37,
		})
	})

	// The calendar month, not a rolling window.
	it('counts from the first day of the current month', async () => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date('2026-09-17T22:45:00.000Z'))

		await useCase.execute()

		expect(repository.countResolvedSince).toHaveBeenCalledWith(
			new Date('2026-09-01T00:00:00.000Z'),
		)
	})

	it('opens a new window on the first of the month', async () => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))

		await useCase.execute()

		expect(repository.countResolvedSince).toHaveBeenCalledWith(
			new Date('2026-01-01T00:00:00.000Z'),
		)
	})

	it('reads nothing but the two counts', async () => {
		await useCase.execute()

		expect(repository.countPublished).toHaveBeenCalledOnce()
		expect(repository.list).not.toHaveBeenCalled()
	})
})
