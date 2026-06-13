import {
	QrTokenStatus as PrismaQrTokenStatus,
	type QrToken as PrismaQrToken,
} from '@retrouve-ci/database'

import type { QrToken } from '../models/qr-token.model'
import type { QrTokenStatus } from '../types/qr-token.types'

export function toDomainQrToken(qrToken: PrismaQrToken): QrToken {
	return {
		id: qrToken.id,
		code: qrToken.code,
		status: toDomainStatus(qrToken.status),
		batch: qrToken.batch,
		label: qrToken.label,
		linkedObject: qrToken.linkedObject,
		userId: qrToken.userId,
		createdAt: qrToken.createdAt,
		activatedAt: qrToken.activatedAt,
		revokedAt: qrToken.revokedAt,
	}
}

export function toPrismaStatus(status: QrTokenStatus): PrismaQrTokenStatus {
	return status === 'generated'
		? PrismaQrTokenStatus.GENERATED
		: status === 'activated'
			? PrismaQrTokenStatus.ACTIVATED
			: PrismaQrTokenStatus.REVOKED
}

export function toDomainStatus(status: PrismaQrTokenStatus): QrTokenStatus {
	return status === PrismaQrTokenStatus.GENERATED
		? 'generated'
		: status === PrismaQrTokenStatus.ACTIVATED
			? 'activated'
			: 'revoked'
}
