import {
	ModerationStatus as PrismaModerationStatus,
	QrTokenStatus as PrismaQrTokenStatus,
	ResolutionStatus as PrismaResolutionStatus,
	type QrToken as PrismaQrToken,
} from '@app/database'

import type { LinkedLostItem, QrToken } from '../types/qr-token.types'
import type { QrTokenStatus } from '../types/qr-token.types'

export interface LinkedLostItemRow {
	id: string
	title: string
	ville: string
	photos: string[]
	moderationStatus: PrismaModerationStatus
	resolutionStatus: PrismaResolutionStatus
}

/**
 * The one place deciding whether a linked listing may be shown to a finder.
 * Pure, so a spec covers every combination of the two statuses — a database
 * this repo cannot start would otherwise be the only witness.
 */
export function toLinkedLostItem(
	row: LinkedLostItemRow | null,
): LinkedLostItem | null {
	if (
		!row ||
		row.moderationStatus !== PrismaModerationStatus.PUBLISHED ||
		row.resolutionStatus !== PrismaResolutionStatus.ACTIVE
	) {
		return null
	}

	// One photo at most: `/q/:code` draws a line, not a gallery.
	return {
		id: row.id,
		title: row.title,
		ville: row.ville,
		photo: row.photos[0] ?? null,
	}
}

export function toDomainQrToken(qrToken: PrismaQrToken): QrToken {
	return {
		id: qrToken.id,
		code: qrToken.code,
		status: toDomainStatus(qrToken.status),
		batch: qrToken.batch,
		label: qrToken.label,
		linkedObject: qrToken.linkedObject,
		directContact: qrToken.directContact,
		lostItemId: qrToken.lostItemId,
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
