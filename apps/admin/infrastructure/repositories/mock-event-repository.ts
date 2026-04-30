import type { IEventRepository } from '@/domain/repositories/event-repository'
import type { Event, Activity } from '@/domain/entities/event'
import { MOCK_EVENTS, MOCK_ACTIVITIES } from '@/infrastructure/mock/data'

class MockEventRepository implements IEventRepository {
	async getAll(): Promise<Event[]> {
		return [...MOCK_EVENTS]
	}

	async getRecentActivities(limit = 10): Promise<Activity[]> {
		return MOCK_ACTIVITIES.slice(0, limit)
	}
}

export const eventRepository: IEventRepository = new MockEventRepository()
