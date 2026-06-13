import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator'
import {
	DEFAULT_PAGE_SIZE,
	MAX_PAGE_SIZE,
	QR_TOKEN_STATUSES,
} from '@/domains/qr-codes/constants'
import type { QrTokenStatus } from '@/domains/qr-codes/types/qr-token.types'

export class ListQrTokensQueryDto {
	@ApiPropertyOptional({ enum: QR_TOKEN_STATUSES })
	@IsOptional()
	@IsIn(QR_TOKEN_STATUSES)
	status?: QrTokenStatus

	@ApiPropertyOptional({ minimum: 1, default: 1 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page: number = 1

	@ApiPropertyOptional({
		minimum: 1,
		maximum: MAX_PAGE_SIZE,
		default: DEFAULT_PAGE_SIZE,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(MAX_PAGE_SIZE)
	pageSize: number = DEFAULT_PAGE_SIZE
}
