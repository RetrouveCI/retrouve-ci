import { Injectable } from '@nestjs/common'
import { QrTokenStatus as PrismaQrTokenStatus } from '@retrouve-ci/database'
import { PrismaService } from '@/infrastructure/database/prisma.service'
import { toDomainQrToken, toPrismaStatus } from '../mappers/qr-token.mapper'
import type { QrToken, QrTokenListResponse } from '../models/qr-token.model'
import type {
	ActivateQrTokenData,
	ListQrTokensFilter,
	UpdateQrTokenData,
} from '../types/qr-token.types'
import type { QrTokenRepository } from './qr-token.repository'

@Injectable()
export class QrTokenRepositoryService implements QrTokenRepository {
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

	async activate(
		code: string,
		userId: string,
		data: ActivateQrTokenData,
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

	async updateDetails(code: string, data: UpdateQrTokenData): Promise<QrToken> {
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

	async list(filter: ListQrTokensFilter): Promise<QrTokenListResponse> {
		const where = {
			...(filter.status && { status: toPrismaStatus(filter.status) }),
			...(filter.userId && { userId: filter.userId }),
		}

		const [items, total] = await Promise.all([
			this.prisma.qrToken.findMany({
				where,
				orderBy: { createdAt: 'desc' },
				skip: (filter.page - 1) * filter.pageSize,
				take: filter.pageSize,
			}),
			this.prisma.qrToken.count({ where }),
		])

		return {
			items: items.map(toDomainQrToken),
			total,
			page: filter.page,
			pageSize: filter.pageSize,
		}
	}
}
