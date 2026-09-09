import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/infrastructures/database/prisma.service'
import type { PushSubscriptionRecord } from '../types/push-subscription.types'

@Injectable()
export class PushSubscriptionRepository {
	constructor(private readonly prisma: PrismaService) {}

	// Keyed on the endpoint, so re-subscribing moves the row; the owner is
	// written on both sides, so a device changing hands re-registers.
	upsert(
		userId: string,
		{ endpoint, p256dh, auth }: PushSubscriptionRecord,
	): Promise<{ id: string }> {
		return this.prisma.pushSubscription.upsert({
			where: { endpoint },
			create: { endpoint, p256dh, auth, userId },
			update: { p256dh, auth, userId },
			select: { id: true },
		})
	}

	// Scoped to the caller, so naming someone else's endpoint deletes nothing.
	async deleteOwn(userId: string, endpoint: string): Promise<number> {
		const { count } = await this.prisma.pushSubscription.deleteMany({
			where: { endpoint, userId },
		})

		return count
	}

	countAll(): Promise<number> {
		return this.prisma.pushSubscription.count()
	}
}
