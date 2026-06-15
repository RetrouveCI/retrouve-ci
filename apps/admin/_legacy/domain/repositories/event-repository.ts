import type { Event, Activity } from '@/domain/entities/event'

export interface IEventRepository {
	getAll(): Promise<Event[]>
	getRecentActivities(limit?: number): Promise<Activity[]>
}
