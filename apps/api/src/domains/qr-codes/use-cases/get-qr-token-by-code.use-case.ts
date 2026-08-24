import { Injectable } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { requireQrToken } from '../helpers/require-qr-token'
import { QrTokenRepository } from '../repository/qr-token.repository'
import type { QrToken } from '../types/qr-token.types'

@Injectable()
export class GetQrTokenByCodeUseCase
	implements IDomainUseCase<string, QrToken>
{
	constructor(private readonly repository: QrTokenRepository) {}

	async execute(code: string): Promise<QrToken> {
		return requireQrToken(this.repository, code)
	}
}
