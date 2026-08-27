import { vi } from 'vitest'
import type { ReportingRepository } from '../repository/reporting.repository'
import type { DashboardStats } from '../types/dashboard-stats.types'

export function buildDashboardStats(
	overrides: Partial<DashboardStats> = {},
): DashboardStats {
	const stat = { value: 42, change: 10 }
	return {
		qrGenerated: stat,
		qrActivated: stat,
		scans: stat,
		contacts: stat,
		postsLost: stat,
		postsFound: stat,
		newUsers: stat,
		activityChart: [{ date: '16 Jun', scans: 3, activations: 1 }],
		categoryChart: [{ category: 'PHONE', lost: 5, found: 2 }],
		recentActivities: [
			{
				id: 'act-1',
				type: 'contact',
				text: 'Konan a contacté via sticker RCI-ABC123',
				createdAt: '2026-01-01T00:00:00.000Z',
			},
		],
		...overrides,
	}
}

/** The repository is a concrete class, so a double is a partial cast. */
export function buildRepository(): ReportingRepository {
	return {
		getDashboardStats: vi.fn(),
	} as unknown as ReportingRepository
}
