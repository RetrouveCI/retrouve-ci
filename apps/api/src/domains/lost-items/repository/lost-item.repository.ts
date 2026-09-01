import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/infrastructures/database/prisma.service'
import {
	toDomainLostItem,
	toDomainModerationStatus,
	toDomainResolutionStatus,
	toPrismaCategory,
	toPrismaModerationStatus,
	toPrismaResolutionStatus,
	toPrismaType,
} from '../mappers/lost-item.mapper'
import { toPaginated, toPrismaPage } from '@/shared/utils/pagination.util'
import type {
	CreateLostItemData,
	ListLostItemsFilter,
	LostItem,
	LostItemListResponse,
	LostItemOwnerSummary,
	MatchCandidatesFilter,
	ModerationStatus,
	ResolutionStatus,
	UpdateLostItemData,
} from '../types/lost-item.types'

const EMPTY_LIFECYCLE: Record<ResolutionStatus, number> = {
	active: 0,
	resolved: 0,
	expired: 0,
}

const EMPTY_MODERATION: Record<ModerationStatus, number> = {
	pending: 0,
	published: 0,
	hidden: 0,
}

@Injectable()
export class LostItemRepository {
	constructor(private readonly prisma: PrismaService) {}

	async create(data: CreateLostItemData): Promise<LostItem> {
		const lostItem = await this.prisma.lostItem.create({
			data: {
				type: toPrismaType(data.type),
				category: toPrismaCategory(data.category),
				title: data.title,
				description: data.description,
				ville: data.ville,
				commune: data.commune ?? null,
				eventDate: data.eventDate,
				contactName: data.contactName,
				contactWhatsapp: data.contactWhatsapp,
				photos: data.photos ?? [],
				userId: data.userId,
			},
		})

		return toDomainLostItem(lostItem)
	}

	async findById(id: string): Promise<LostItem | null> {
		const lostItem = await this.prisma.lostItem.findUnique({ where: { id } })

		return lostItem ? toDomainLostItem(lostItem) : null
	}

	async list(filter: ListLostItemsFilter): Promise<LostItemListResponse> {
		const where = {
			...(filter.type && { type: toPrismaType(filter.type) }),
			...(filter.category && { category: toPrismaCategory(filter.category) }),
			...(filter.ville && { ville: filter.ville }),
			...(filter.commune && { commune: filter.commune }),
			...((filter.dateFrom || filter.dateTo) && {
				eventDate: {
					...(filter.dateFrom && { gte: filter.dateFrom }),
					...(filter.dateTo && { lte: filter.dateTo }),
				},
			}),
			...(filter.moderationStatus && {
				moderationStatus: toPrismaModerationStatus(filter.moderationStatus),
			}),
			...(filter.resolutionStatus && {
				resolutionStatus: toPrismaResolutionStatus(filter.resolutionStatus),
			}),
			...(filter.userId && { userId: filter.userId }),
			...(filter.search && {
				OR: [
					{ title: { contains: filter.search, mode: 'insensitive' as const } },
					{
						description: {
							contains: filter.search,
							mode: 'insensitive' as const,
						},
					},
				],
			}),
		}

		const [items, total] = await Promise.all([
			this.prisma.lostItem.findMany({
				where,
				orderBy: { createdAt: 'desc' },
				...toPrismaPage(filter),
			}),
			this.prisma.lostItem.count({ where }),
		])

		return toPaginated(items.map(toDomainLostItem), total, filter)
	}

	/**
	 * Two `groupBy` calls rather than a scan: the owner's page is capped, so any
	 * count taken from it stops being true at the cap. Both are narrowed by
	 * `userId`, which is the whole authorisation of this route.
	 */
	async summarizeByOwner(userId: string): Promise<LostItemOwnerSummary> {
		const [byLifecycle, byModeration] = await Promise.all([
			this.prisma.lostItem.groupBy({
				by: ['resolutionStatus'],
				where: { userId },
				_count: { _all: true },
			}),
			this.prisma.lostItem.groupBy({
				by: ['moderationStatus'],
				where: { userId },
				_count: { _all: true },
			}),
		])

		const lifecycle = { ...EMPTY_LIFECYCLE }
		let total = 0
		for (const row of byLifecycle) {
			lifecycle[toDomainResolutionStatus(row.resolutionStatus)] =
				row._count._all
			total += row._count._all
		}

		const moderation = { ...EMPTY_MODERATION }
		for (const row of byModeration) {
			moderation[toDomainModerationStatus(row.moderationStatus)] =
				row._count._all
		}

		return { total, lifecycle, moderation }
	}

	async findMatchCandidates(
		filter: MatchCandidatesFilter,
	): Promise<LostItem[]> {
		const items = await this.prisma.lostItem.findMany({
			where: {
				type: toPrismaType(filter.type),
				moderationStatus: toPrismaModerationStatus(filter.moderationStatus),
				resolutionStatus: toPrismaResolutionStatus(filter.resolutionStatus),
				OR: [
					{ category: toPrismaCategory(filter.category) },
					{ ville: { equals: filter.ville, mode: 'insensitive' } },
				],
			},
			orderBy: { createdAt: 'desc' },
			take: filter.limit,
		})

		return items.map(toDomainLostItem)
	}

	async update(id: string, data: UpdateLostItemData): Promise<LostItem> {
		const lostItem = await this.prisma.lostItem.update({
			where: { id },
			data: {
				...(data.title !== undefined && { title: data.title }),
				...(data.description !== undefined && {
					description: data.description,
				}),
				...(data.ville !== undefined && { ville: data.ville }),
				...(data.commune !== undefined && { commune: data.commune }),
				...(data.eventDate !== undefined && { eventDate: data.eventDate }),
				...(data.contactName !== undefined && {
					contactName: data.contactName,
				}),
				...(data.contactWhatsapp !== undefined && {
					contactWhatsapp: data.contactWhatsapp,
				}),
				...(data.photos !== undefined && { photos: data.photos }),
				...(data.resolutionStatus !== undefined && {
					resolutionStatus: toPrismaResolutionStatus(data.resolutionStatus),
				}),
			},
		})

		return toDomainLostItem(lostItem)
	}

	async updateModerationStatus(
		id: string,
		moderationStatus: ModerationStatus,
	): Promise<LostItem> {
		const lostItem = await this.prisma.lostItem.update({
			where: { id },
			data: { moderationStatus: toPrismaModerationStatus(moderationStatus) },
		})

		return toDomainLostItem(lostItem)
	}

	async delete(id: string): Promise<void> {
		await this.prisma.lostItem.delete({ where: { id } })
	}

	async incrementViews(id: string): Promise<void> {
		await this.prisma.lostItem.update({
			where: { id },
			data: { views: { increment: 1 } },
		})
	}

	async incrementContacts(id: string): Promise<void> {
		await this.prisma.lostItem.update({
			where: { id },
			data: {
				contactsCount: {
					increment: 1,
				},
			},
		})
	}
}
