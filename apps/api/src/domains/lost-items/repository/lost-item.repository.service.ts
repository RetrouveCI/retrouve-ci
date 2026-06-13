import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/infrastructure/database/prisma.service'
import {
	toDomainLostItem,
	toPrismaCategory,
	toPrismaModerationStatus,
	toPrismaResolutionStatus,
	toPrismaType,
} from '../mappers/lost-item.mapper'
import type { LostItem, LostItemListResponse } from '../models/lost-item.model'
import type {
	CreateLostItemData,
	ListLostItemsFilter,
	UpdateLostItemData,
} from '../types/lost-item.types'
import type { LostItemRepository } from './lost-item.repository'

@Injectable()
export class LostItemRepositoryService implements LostItemRepository {
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
			...(filter.moderationStatus && {
				moderationStatus: toPrismaModerationStatus(filter.moderationStatus),
			}),
			...(filter.resolutionStatus && {
				resolutionStatus: toPrismaResolutionStatus(filter.resolutionStatus),
			}),
			...(filter.userId && { userId: filter.userId }),
		}

		const [items, total] = await Promise.all([
			this.prisma.lostItem.findMany({
				where,
				orderBy: { createdAt: 'desc' },
				skip: (filter.page - 1) * filter.pageSize,
				take: filter.pageSize,
			}),
			this.prisma.lostItem.count({ where }),
		])

		return {
			items: items.map(toDomainLostItem),
			total,
			page: filter.page,
			pageSize: filter.pageSize,
		}
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
