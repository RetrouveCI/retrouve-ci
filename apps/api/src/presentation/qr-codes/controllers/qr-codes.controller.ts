import {
	Body,
	Controller,
	Get,
	Param,
	Patch,
	Post,
	Query,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { AllowAnonymous, Session } from '@thallesp/nestjs-better-auth'
import type { UserSession } from '@thallesp/nestjs-better-auth'
import type { auth } from '@/infrastructure/auth/auth.config'
import { QrTokenUseCases } from '@/domains/qr-codes/use-cases/qr-token.use-cases'
import { ActivateQrTokenDto } from '../dto/activate-qr-token.dto'
import { GenerateQrTokensDto } from '../dto/generate-qr-tokens.dto'
import { ListQrTokensQueryDto } from '../dto/list-qr-tokens.query.dto'
import { UpdateQrTokenDto } from '../dto/update-qr-token.dto'

@ApiTags('qr-codes')
@ApiBearerAuth()
@Controller('qr-codes')
export class QrCodesController {
	constructor(private readonly qrTokenUseCases: QrTokenUseCases) {}

	@Post('generate')
	generate(@Body() dto: GenerateQrTokensDto) {
		return this.qrTokenUseCases.generateBatch(dto)
	}

	@Get()
	list(@Query() query: ListQrTokensQueryDto) {
		return this.qrTokenUseCases.list(query)
	}

	@Get('mine')
	listMine(
		@Session() session: UserSession<typeof auth>,
		@Query() query: ListQrTokensQueryDto,
	) {
		return this.qrTokenUseCases.listMine(session.user.id, query)
	}

	@Get(':code')
	@AllowAnonymous()
	getOne(@Param('code') code: string) {
		return this.qrTokenUseCases.getByCode(code)
	}

	@Post(':code/activate')
	activate(
		@Session() session: UserSession<typeof auth>,
		@Param('code') code: string,
		@Body() dto: ActivateQrTokenDto,
	) {
		return this.qrTokenUseCases.activate(code, session.user.id, dto)
	}

	@Patch(':code')
	update(
		@Session() session: UserSession<typeof auth>,
		@Param('code') code: string,
		@Body() dto: UpdateQrTokenDto,
	) {
		return this.qrTokenUseCases.updateDetails(code, session.user.id, dto)
	}

	@Post(':code/revoke')
	revoke(
		@Session() session: UserSession<typeof auth>,
		@Param('code') code: string,
	) {
		return this.qrTokenUseCases.revoke(code, session.user.id)
	}
}
