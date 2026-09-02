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
import {
	contactOwnerSchema,
	generateQrTokensSchema,
	listQrTokensFilterSchema,
	qrTokenDetailsSchema,
	type ContactOwnerData,
	type GenerateQrTokensData,
	type ListQrTokensFilterData,
	type QrTokenDetailsData,
} from '@app/contracts/qr-codes'
import { AllowAnonymous, Roles, Session } from '@thallesp/nestjs-better-auth'
import type { UserSession } from '@thallesp/nestjs-better-auth'
import type { Auth } from '@/infrastructures/auth/auth.config'
import { ActivateQrTokenUseCase } from '@/domains/qr-codes/use-cases/activate-qr-token.use-case'
import { ContactQrTokenOwnerUseCase } from '@/domains/qr-codes/use-cases/contact-qr-token-owner.use-case'
import { GenerateQrTokensUseCase } from '@/domains/qr-codes/use-cases/generate-qr-tokens.use-case'
import { GetMyQrTokensUseCase } from '@/domains/qr-codes/use-cases/get-my-qr-tokens.use-case'
import { GetMyStickerSummaryUseCase } from '@/domains/qr-codes/use-cases/get-my-sticker-summary.use-case'
import { GetPaginatedQrTokensUseCase } from '@/domains/qr-codes/use-cases/get-paginated-qr-tokens.use-case'
import { GetQrTokenByCodeUseCase } from '@/domains/qr-codes/use-cases/get-qr-token-by-code.use-case'
import { GetQrTokenPublicViewUseCase } from '@/domains/qr-codes/use-cases/get-qr-token-public-view.use-case'
import { RevokeQrTokenUseCase } from '@/domains/qr-codes/use-cases/revoke-qr-token.use-case'
import { UpdateQrTokenDetailsUseCase } from '@/domains/qr-codes/use-cases/update-qr-token-details.use-case'
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe'
import { ApiZodBody, ApiZodQuery } from '@/shared/swagger/api-zod.decorator'

@ApiTags('qr-codes')
@ApiBearerAuth()
@Controller('qr-codes')
export class QrCodesController {
	constructor(
		private readonly generateQrTokensUseCase: GenerateQrTokensUseCase,
		private readonly getQrTokenByCodeUseCase: GetQrTokenByCodeUseCase,
		private readonly getQrTokenPublicViewUseCase: GetQrTokenPublicViewUseCase,
		private readonly activateQrTokenUseCase: ActivateQrTokenUseCase,
		private readonly revokeQrTokenUseCase: RevokeQrTokenUseCase,
		private readonly updateQrTokenDetailsUseCase: UpdateQrTokenDetailsUseCase,
		private readonly getPaginatedQrTokensUseCase: GetPaginatedQrTokensUseCase,
		private readonly getMyQrTokensUseCase: GetMyQrTokensUseCase,
		private readonly getMyStickerSummaryUseCase: GetMyStickerSummaryUseCase,
		private readonly contactQrTokenOwnerUseCase: ContactQrTokenOwnerUseCase,
	) {}

	@Post('generate')
	@Roles(['admin'])
	@ApiZodBody(generateQrTokensSchema)
	generate(
		@Body(new ZodValidationPipe(generateQrTokensSchema))
		data: GenerateQrTokensData,
	) {
		return this.generateQrTokensUseCase.execute(data)
	}

	@Get()
	@Roles(['admin'])
	@ApiZodQuery(listQrTokensFilterSchema)
	list(
		@Query(new ZodValidationPipe(listQrTokensFilterSchema))
		filter: ListQrTokensFilterData,
	) {
		return this.getPaginatedQrTokensUseCase.execute(filter)
	}

	@Get('mine')
	@ApiZodQuery(listQrTokensFilterSchema)
	listMine(
		@Session() session: UserSession<Auth>,
		@Query(new ZodValidationPipe(listQrTokensFilterSchema))
		filter: ListQrTokensFilterData,
	) {
		return this.getMyQrTokensUseCase.execute({
			userId: session.user.id,
			filter,
		})
	}

	/**
	 * A route of its own rather than a field on `mine`: that list holds only the
	 * tokens the visitor owns, and a sticker waiting to be activated has no
	 * owner yet, so it appears in no list.
	 */
	@Get('mine/summary')
	listMineSummary(@Session() session: UserSession<Auth>) {
		return this.getMyStickerSummaryUseCase.execute(session.user.id)
	}

	@Get(':code/scan')
	@AllowAnonymous()
	getPublicView(@Param('code') code: string) {
		return this.getQrTokenPublicViewUseCase.execute(code)
	}

	/**
	 * The whole token, owner id included. `/:code/scan` is what a finder gets;
	 * this one is the backoffice's, and holding a code is not a credential.
	 */
	@Get(':code')
	@Roles(['admin'])
	getOne(@Param('code') code: string) {
		return this.getQrTokenByCodeUseCase.execute(code)
	}

	@Post(':code/activate')
	@ApiZodBody(qrTokenDetailsSchema)
	activate(
		@Session() session: UserSession<Auth>,
		@Param('code') code: string,
		@Body(new ZodValidationPipe(qrTokenDetailsSchema)) data: QrTokenDetailsData,
	) {
		return this.activateQrTokenUseCase.execute({
			code,
			userId: session.user.id,
			data,
		})
	}

	@Post(':code/contact')
	@AllowAnonymous()
	@ApiZodBody(contactOwnerSchema)
	async contactOwner(
		@Param('code') code: string,
		@Body(new ZodValidationPipe(contactOwnerSchema)) data: ContactOwnerData,
	) {
		await this.contactQrTokenOwnerUseCase.execute({ code, ...data })

		return { success: true }
	}

	@Patch(':code')
	@ApiZodBody(qrTokenDetailsSchema)
	update(
		@Session() session: UserSession<Auth>,
		@Param('code') code: string,
		@Body(new ZodValidationPipe(qrTokenDetailsSchema)) data: QrTokenDetailsData,
	) {
		return this.updateQrTokenDetailsUseCase.execute({
			code,
			userId: session.user.id,
			data,
		})
	}

	@Post(':code/revoke')
	revoke(@Session() session: UserSession<Auth>, @Param('code') code: string) {
		return this.revokeQrTokenUseCase.execute({ code, userId: session.user.id })
	}
}
