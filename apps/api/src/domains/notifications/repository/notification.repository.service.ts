import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/infrastructure/database/prisma.service'
import {
	toDomainNotification,
	toPrismaType,
} from '../mappers/notification.mapper'
import type {
	Notification,
	NotificationListResponse,
} from '../models/notification.model'
import type {
	CreateNotificationData,
	ListNotificationsFilter,
} from '../types/notification.types'
import type { NotificationRepository } from './notification.repository'

@Injectable()
export class NotificationRepositoryService implements NotificationRepository {
	constructor(private readonly prisma: PrismaService) {}

	async create(data: CreateNotificationData): Promise<Notification> {
		const notification = await this.prisma.notification.create({
			data: {
				type: toPrismaType(data.type),
				title: data.title,
				message: data.message,
				link: data.link ?? null,
				userId: data.userId,
			},
		})

		return toDomainNotification(notification)
	}

	async findById(id: string): Promise<Notification | null> {
		const notification = await this.prisma.notification.findUnique({
			where: { id },
		})

		return notification ? toDomainNotification(notification) : null
	}

	async list(
		filter: ListNotificationsFilter,
	): Promise<NotificationListResponse> {
		const where = {
			userId: filter.userId,
			...(filter.read !== undefined && { read: filter.read }),
		}

		const [items, total] = await Promise.all([
			this.prisma.notification.findMany({
				where,
				orderBy: { createdAt: 'desc' },
				skip: (filter.page - 1) * filter.pageSize,
				take: filter.pageSize,
			}),
			this.prisma.notification.count({ where }),
		])

		return {
			items: items.map(toDomainNotification),
			total,
			page: filter.page,
			pageSize: filter.pageSize,
		}
	}

	async markAsRead(id: string): Promise<Notification> {
		const notification = await this.prisma.notification.update({
			where: { id },
			data: { read: true, readAt: new Date() },
		})

		return toDomainNotification(notification)
	}

	async markAllAsRead(userId: string): Promise<void> {
		await this.prisma.notification.updateMany({
			where: { userId, read: false },
			data: { read: true, readAt: new Date() },
		})
	}

	async countUnread(userId: string): Promise<number> {
		return this.prisma.notification.count({
			where: { userId, read: false },
		})
	}
}
