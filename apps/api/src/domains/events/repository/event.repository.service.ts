import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/infrastructure/database/prisma.service'
import { toDomainEvent, toPrismaStatus } from '../mappers/event.mapper'
import type { Event, EventListResponse } from '../models/event.model'
import type {
	CreateEventData,
	ListEventsFilter,
	UpdateEventData,
} from '../types/event.types'
import type { EventRepository } from './event.repository'

@Injectable()
export class EventRepositoryService implements EventRepository {
	constructor(private readonly prisma: PrismaService) {}

	async create(data: CreateEventData): Promise<Event> {
		const event = await this.prisma.event.create({
			data: {
				title: data.title,
				description: data.description,
				location: data.location,
				ville: data.ville,
				commune: data.commune ?? null,
				eventDate: data.eventDate,
			},
		})

		return toDomainEvent(event)
	}

	async findById(id: string): Promise<Event | null> {
		const event = await this.prisma.event.findUnique({ where: { id } })

		return event ? toDomainEvent(event) : null
	}

	async list(filter: ListEventsFilter): Promise<EventListResponse> {
		const where = {
			...(filter.status && { status: toPrismaStatus(filter.status) }),
		}

		const [items, total] = await Promise.all([
			this.prisma.event.findMany({
				where,
				orderBy: { eventDate: 'asc' },
				skip: (filter.page - 1) * filter.pageSize,
				take: filter.pageSize,
			}),
			this.prisma.event.count({ where }),
		])

		return {
			items: items.map(toDomainEvent),
			total,
			page: filter.page,
			pageSize: filter.pageSize,
		}
	}

	async update(id: string, data: UpdateEventData): Promise<Event> {
		const event = await this.prisma.event.update({
			where: { id },
			data: {
				...(data.title !== undefined && { title: data.title }),
				...(data.description !== undefined && {
					description: data.description,
				}),
				...(data.location !== undefined && { location: data.location }),
				...(data.ville !== undefined && { ville: data.ville }),
				...(data.commune !== undefined && { commune: data.commune }),
				...(data.eventDate !== undefined && { eventDate: data.eventDate }),
				...(data.status !== undefined && {
					status: toPrismaStatus(data.status),
				}),
			},
		})

		return toDomainEvent(event)
	}

	async delete(id: string): Promise<void> {
		await this.prisma.event.delete({ where: { id } })
	}
}
