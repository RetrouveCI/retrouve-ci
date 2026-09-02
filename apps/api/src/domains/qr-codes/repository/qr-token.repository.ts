import { Injectable } from '@nestjs/common'
import { QrTokenStatus as PrismaQrTokenStatus } from '@app/database'
import { PrismaService } from '@/infrastructures/database/prisma.service'
import {
	toDomainQrToken,
	toDomainStatus,
	toPrismaStatus,
} from '../mappers/qr-token.mapper'
import { toPaginated, toPrismaPage } from '@/shared/utils/pagination.util'
import type {
	ListQrTokensFilter,
	QrToken,
	QrTokenDetailsData,
	QrTokenListResponse,
	QrTokenPublicView,
} from '../types/qr-token.types'

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

	async findPublicView(code: string): Promise<QrTokenPublicView | null> {
		const qrToken = await this.prisma.qrToken.findUnique({
			where: { code },
			include: { user: { select: { name: true } } },
		})

		if (!qrToken) return null

		return {
			status: toDomainStatus(qrToken.status),
			ownerFirstName: qrToken.user?.name.split(' ')[0] ?? null,
			label: qrToken.label,
			linkedObject: qrToken.linkedObject,
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
}
