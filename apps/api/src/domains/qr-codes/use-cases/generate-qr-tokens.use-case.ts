import { Injectable } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { generateQrCode } from '../helpers/generate-qr-code'
import { QrTokenRepository } from '../repository/qr-token.repository'
import type { GenerateQrTokensData, QrToken } from '../types/qr-token.types'

@Injectable()
export class GenerateQrTokensUseCase implements IDomainUseCase<
	GenerateQrTokensData,
	QrToken[]
> {
	constructor(private readonly repository: QrTokenRepository) {}

	async execute(data: GenerateQrTokensData): Promise<QrToken[]> {
		const codes = Array.from({ length: data.count }, () => generateQrCode())

		return this.repository.createMany(codes, data.batch)
	}
}
