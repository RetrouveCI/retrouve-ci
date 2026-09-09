import { Injectable } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { QrTokenNotFoundError } from '../errors/qr-token.errors'
import { shouldRecordScan } from '../helpers/should-record-scan'
import { QrTokenRepository } from '../repository/qr-token.repository'
import type { QrTokenPublicView } from '../types/qr-token.types'

/** What a scan shows to a finder: the owner's first name, never the account. */
@Injectable()
export class GetQrTokenPublicViewUseCase implements IDomainUseCase<
	string,
	QrTokenPublicView
> {
	constructor(private readonly repository: QrTokenRepository) {}

	// A read that writes, as `ViewLostItemUseCase` already is: this endpoint is
	// the only moment anyone learns the sticker was read. The trace stays out of
	// the response — it is the owner's, not the finder's.
	async execute(code: string): Promise<QrTokenPublicView> {
		const read = await this.repository.findPublicView(code)

		if (!read) {
			throw new QrTokenNotFoundError(code)
		}

		const now = new Date()

		if (shouldRecordScan(read.lastScannedAt, now)) {
			await this.repository.recordScan(code, now)
		}

		return read.view
	}
}
