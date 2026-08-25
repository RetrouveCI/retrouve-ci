import { Injectable } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { QrTokenNotFoundError } from '../errors/qr-token.errors'
import { QrTokenRepository } from '../repository/qr-token.repository'
import type { QrTokenPublicView } from '../types/qr-token.types'

/** What a scan shows to a finder: the owner's first name, never the account. */
@Injectable()
export class GetQrTokenPublicViewUseCase implements IDomainUseCase<
	string,
	QrTokenPublicView
> {
	constructor(private readonly repository: QrTokenRepository) {}

	async execute(code: string): Promise<QrTokenPublicView> {
		const view = await this.repository.findPublicView(code)

		if (!view) {
			throw new QrTokenNotFoundError(code)
		}

		return view
	}
}
