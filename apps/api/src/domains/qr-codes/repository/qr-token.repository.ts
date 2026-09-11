import { Injectable } from '@nestjs/common'
import { QrTokenStatus as PrismaQrTokenStatus } from '@app/database'
import { PrismaService } from '@/infrastructures/database/prisma.service'
import {
	toDomainQrToken,
	toDomainStatus,
	toLinkedLostItem,
	toPrismaStatus,
} from '../mappers/qr-token.mapper'
import { withMessageCounts } from '../helpers/with-message-counts'
import { toPaginated, toPrismaPage } from '@/shared/utils/pagination.util'
import type {
	ListQrTokensFilter,
	OwnedQrTokenListResponse,
	QrToken,
	QrTokenDetailsData,
	QrTokenListResponse,
	QrTokenOwnerReach,
	QrTokenPublicViewRead,
} from '../types/qr-token.types'

// A code is what a finder types, a label and a batch what the desk writes.
export function qrSearchClause(search?: string) {
	if (!search) return {}

	const contains = { contains: search, mode: 'insensitive' as const }

	return { OR: [{ code: contains }, { label: contains }, { batch: contains }] }
}

@Injectable()
export class QrTokenRepository {
	constructor(private readonly prisma: PrismaService) {}

	async createMany(codes: string[], batch?: string): Promise<QrToken[]> {
		await this.prisma.qrToken.createMany({
			data: codes.map(code => ({ code, batch: batch ?? null })),
		})

		const created = await this.prisma.qrToken.findMany({
			where: { code: { in: codes } },
		})

		return created.map(toDomainQrToken)
	}

	async findByCode(code: string): Promise<QrToken | null> {
		const qrToken = await this.prisma.qrToken.findUnique({ where: { code } })

		return qrToken ? toDomainQrToken(qrToken) : null
	}

	async findPublicView(code: string): Promise<QrTokenPublicViewRead | null> {
		const qrToken = await this.prisma.qrToken.findUnique({
			where: { code },
			include: {
				user: { select: { name: true } },
				// Weighed by `toLinkedLostItem`, not by a `where`: Prisma types one on
				// a to-one include, but nothing here can prove it applies, and that
				// is not a filter to trust with unmoderated content.
				lostItem: {
					select: {
						id: true,
						title: true,
						ville: true,
						photos: true,
						moderationStatus: true,
						resolutionStatus: true,
					},
				},
			},
		})

		if (!qrToken) return null

		return {
			view: {
				status: toDomainStatus(qrToken.status),
				ownerFirstName: qrToken.user?.name.split(' ')[0] ?? null,
				label: qrToken.label,
				linkedObject: qrToken.linkedObject,
				directContact: qrToken.directContact,
				lostItem: toLinkedLostItem(qrToken.lostItem),
			},
			lastScannedAt: qrToken.lastScannedAt,
		}
	}

	async recordScan(code: string, at: Date): Promise<void> {
		await this.prisma.qrToken.update({
			where: { code },
			data: { lastScannedAt: at },
		})
	}

	/**
	 * Points the sticker at a listing, or clears it with `null`. A sticker sits
	 * on one object, so the newest listing simply replaces the previous link.
	 */
	async linkToLostItem(code: string, lostItemId: string | null): Promise<void> {
		await this.prisma.qrToken.update({ where: { code }, data: { lostItemId } })
	}

	/**
	 * The only query here that selects `phoneNumber`, and separate from
	 * `findPublicView` on purpose: that one feeds a response, this one a redirect.
	 */
	async findOwnerReach(code: string): Promise<QrTokenOwnerReach | null> {
		const qrToken = await this.prisma.qrToken.findUnique({
			where: { code },
			include: { user: { select: { id: true, phoneNumber: true } } },
		})

		if (!qrToken) return null

		return {
			status: toDomainStatus(qrToken.status),
			directContact: qrToken.directContact,
			label: qrToken.label,
			ownerUserId: qrToken.user?.id ?? null,
			ownerPhoneNumber: qrToken.user?.phoneNumber ?? null,
		}
	}

	async activate(
		code: string,
		userId: string,
		data: QrTokenDetailsData,
	): Promise<QrToken> {
		const qrToken = await this.prisma.qrToken.update({
			where: { code },
			data: {
				status: PrismaQrTokenStatus.ACTIVATED,
				userId,
				label: data.label ?? null,
				linkedObject: data.linkedObject ?? null,
				directContact: data.directContact ?? false,
				activatedAt: new Date(),
			},
		})

		return toDomainQrToken(qrToken)
	}

	async revoke(code: string): Promise<QrToken> {
		const qrToken = await this.prisma.qrToken.update({
			where: { code },
			data: {
				status: PrismaQrTokenStatus.REVOKED,
				revokedAt: new Date(),
			},
		})

		return toDomainQrToken(qrToken)
	}

	async updateDetails(
		code: string,
		data: QrTokenDetailsData,
	): Promise<QrToken> {
		const qrToken = await this.prisma.qrToken.update({
			where: { code },
			data: {
				...(data.label !== undefined && { label: data.label }),
				...(data.linkedObject !== undefined && {
					linkedObject: data.linkedObject,
				}),
				...(data.directContact !== undefined && {
					directContact: data.directContact,
				}),
			},
		})

		return toDomainQrToken(qrToken)
	}

	async countActivatedByOwner(userId: string): Promise<number> {
		return this.prisma.qrToken.count({
			where: { userId, status: PrismaQrTokenStatus.ACTIVATED },
		})
	}

	async list(filter: ListQrTokensFilter): Promise<QrTokenListResponse> {
		const where = {
			...(filter.status && { status: toPrismaStatus(filter.status) }),
			...(filter.userId && { userId: filter.userId }),
			...qrSearchClause(filter.search),
		}

		const [items, total] = await Promise.all([
			this.prisma.qrToken.findMany({
				where,
				orderBy: { createdAt: 'desc' },
				...toPrismaPage(filter),
			}),
			this.prisma.qrToken.count({ where }),
		])

		return toPaginated(items.map(toDomainQrToken), total, filter)
	}

	/**
	 * The owner's own list. The count is grouped over the codes of this page
	 * only, so it stays bounded by the page size rather than by the batch.
	 */
	async listByOwner(
		filter: ListQrTokensFilter & { userId: string },
	): Promise<OwnedQrTokenListResponse> {
		const page = await this.list(filter)
		const codes = page.items.map(item => item.code)

		const rows = codes.length
			? await this.prisma.contactMessage.groupBy({
					by: ['qrTokenCode'],
					where: { qrTokenCode: { in: codes } },
					_count: { _all: true },
				})
			: []

		return { ...page, items: withMessageCounts(page.items, rows) }
	}
}
