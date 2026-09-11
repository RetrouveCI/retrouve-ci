import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildDashboardStats } from '@/domains/reporting/__tests__/dashboard-stats.fixture'
import type { GetPublicCountersUseCase } from '@/domains/lost-items/use-cases/get-public-counters.use-case'
import type { GetDashboardStatsUseCase } from '@/domains/reporting/use-cases/get-dashboard-stats.use-case'
import type { CountPushSubscriptionsUseCase } from '@/domains/notifications/use-cases/count-push-subscriptions.use-case'
import { StatsController } from '../stats.controller'

function buildUseCase(): GetDashboardStatsUseCase {
	return { execute: vi.fn() } as unknown as GetDashboardStatsUseCase
}

describe('StatsController', () => {
	let getDashboardStatsUseCase: GetDashboardStatsUseCase
	let getPublicCountersUseCase: GetPublicCountersUseCase
	let countPushSubscriptions: CountPushSubscriptionsUseCase
	let controller: StatsController

	beforeEach(() => {
		getDashboardStatsUseCase = buildUseCase()
		getPublicCountersUseCase = {
			execute: vi.fn(),
		} as unknown as GetPublicCountersUseCase
		countPushSubscriptions = {
			execute: vi.fn(),
		} as unknown as CountPushSubscriptionsUseCase
		controller = new StatsController(
			getDashboardStatsUseCase,
			getPublicCountersUseCase,
			countPushSubscriptions,
		)
	})

	describe('getPushSubscriptionCount', () => {
		it('is restricted to admins', () => {
			expect(
				Reflect.getMetadata('ROLES', controller.getPushSubscriptionCount),
			).toEqual(['admin'])
		})

		// A bare number, as `/notifications/unread-count` answers one — the admin
		// badge stayed hidden for a while because it expected `{ count }`.
		it.each([0, 7])('answers the bare count %i', async count => {
			vi.mocked(countPushSubscriptions.execute).mockResolvedValue(count)

			expect(await controller.getPushSubscriptionCount()).toBe(count)
		})
	})

	describe('getDashboardStats', () => {
		it('is restricted to admins', () => {
			expect(
				Reflect.getMetadata('ROLES', controller.getDashboardStats),
			).toEqual(['admin'])
		})

		it('delegates to the use-case', async () => {
			const stats = buildDashboardStats()
			vi.mocked(getDashboardStatsUseCase.execute).mockResolvedValue(stats)

			expect(await controller.getDashboardStats({})).toEqual(stats)
			expect(getDashboardStatsUseCase.execute).toHaveBeenCalledOnce()
		})
	})

	describe('getPublicCounters', () => {
		// An anonymous visitor reads it on the sign-in panel and on the home page.
		it('is open to anonymous callers, and to no role', () => {
			expect(Reflect.getMetadata('PUBLIC', controller.getPublicCounters)).toBe(
				true,
			)
			expect(
				Reflect.getMetadata('ROLES', controller.getPublicCounters),
			).toBeUndefined()
		})

		it('delegates to the use-case', async () => {
			const counters = { published: 412, resolvedThisMonth: 37 }
			vi.mocked(getPublicCountersUseCase.execute).mockResolvedValue(counters)

			expect(await controller.getPublicCounters()).toEqual(counters)
			expect(getPublicCountersUseCase.execute).toHaveBeenCalledOnce()
		})
	})
})
