import { Injectable } from '@nestjs/common'
import { audienceOf } from '@app/contracts/notifications'
import { PrismaService } from '@/infrastructures/database/prisma.service'
import { toPaginated, toPrismaPage } from '@/shared/utils/pagination.util'
import {
	toDomainNotification,
	toPrismaAudience,
	toPrismaType,
} from '../mappers/notification.mapper'
import type {
	CreateNotificationData,
	ListNotificationsFilter,
	Notification,
	NotificationListResponse,
	NotificationScope,
} from '../types/notification.types'

// The only place a notification `where` clause is built, so no query can read
// across the audiences by forgetting to name one.
export function whereFor(scope: NotificationScope) {
	return scope.audience === 'admin'
		? { audience: toPrismaAudience('admin'), userId: null }
		: { audience: toPrismaAudience('user'), userId: scope.userId }
}

@Injectable()
export class NotificationRepository {
	constructor(private readonly prisma: PrismaService) {}

	async create(data: CreateNotificationData): Promise<Notification> {
		const notification = await this.prisma.notification.create({
			data: {
				type: toPrismaType(data.type),
				// Derived from the type, never passed in: one pairing, one place.
				audience: toPrismaAudience(audienceOf(data.type)),
				title: data.title,
				message: data.message,
				link: data.link ?? null,
				userId: data.userId ?? null,
			},
		})

		return toDomainNotification(notification)
	}

	async findInScope(
		id: string,
		scope: NotificationScope,
	): Promise<Notification | null> {
		const notification = await this.prisma.notification.findFirst({
			where: { id, ...whereFor(scope) },
		})

		return notification ? toDomainNotification(notification) : null
	}

	async list(
		filter: ListNotificationsFilter,
	): Promise<NotificationListResponse> {
		const where = {
			...whereFor(filter.scope),
			...(filter.read !== undefined && { read: filter.read }),
		}

		const [items, total] = await Promise.all([
			this.prisma.notification.findMany({
				where,
				orderBy: { createdAt: 'desc' },
				...toPrismaPage(filter),
			}),
			this.prisma.notification.count({ where }),
		])

		return toPaginated(items.map(toDomainNotification), total, filter)
	}

	async markAsRead(id: string): Promise<Notification> {
		const notification = await this.prisma.notification.update({
			where: { id },
			data: { read: true, readAt: new Date() },
		})

		return toDomainNotification(notification)
	}

	async markAllAsRead(scope: NotificationScope): Promise<void> {
		await this.prisma.notification.updateMany({
			where: { ...whereFor(scope), read: false },
			data: { read: true, readAt: new Date() },
		})
	}

	async countUnread(scope: NotificationScope): Promise<number> {
		return this.prisma.notification.count({
			where: { ...whereFor(scope), read: false },
		})
	}
}
