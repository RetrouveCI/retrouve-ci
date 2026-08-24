import {
	BadRequestException,
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
import { QrTokenUseCases } from '@/domains/qr-codes/use-cases/qr-token.use-cases'
import { CreateContactMessageUseCase } from '@/domains/contact-messages/use-cases/create-contact-message.use-case'
import { CreateNotificationUseCase } from '@/domains/notifications/use-cases/create-notification.use-case'
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe'
import { ApiZodBody, ApiZodQuery } from '@/shared/swagger/api-zod.decorator'

@ApiTags('qr-codes')
@ApiBearerAuth()
@Controller('qr-codes')
export class QrCodesController {
	constructor(
		private readonly qrTokenUseCases: QrTokenUseCases,
		private readonly createContactMessage: CreateContactMessageUseCase,
		private readonly createNotification: CreateNotificationUseCase,
	) {}

	@Post('generate')
	@Roles(['admin'])
	@ApiZodBody(generateQrTokensSchema)
	generate(
		@Body(new ZodValidationPipe(generateQrTokensSchema))
		data: GenerateQrTokensData,
	) {
		return this.qrTokenUseCases.generateBatch(data)
	}

	@Get()
	@Roles(['admin'])
	@ApiZodQuery(listQrTokensFilterSchema)
	list(
		@Query(new ZodValidationPipe(listQrTokensFilterSchema))
		filter: ListQrTokensFilterData,
	) {
		return this.qrTokenUseCases.list(filter)
	}

	@Get('mine')
	@ApiZodQuery(listQrTokensFilterSchema)
	listMine(
		@Session() session: UserSession<Auth>,
		@Query(new ZodValidationPipe(listQrTokensFilterSchema))
		filter: ListQrTokensFilterData,
	) {
		return this.qrTokenUseCases.listMine(session.user.id, filter)
	}

	@Get(':code/scan')
	@AllowAnonymous()
	getPublicView(@Param('code') code: string) {
		return this.qrTokenUseCases.getPublicView(code)
	}

	@Get(':code')
	@AllowAnonymous()
	getOne(@Param('code') code: string) {
		return this.qrTokenUseCases.getByCode(code)
	}

	@Post(':code/activate')
	@ApiZodBody(qrTokenDetailsSchema)
	activate(
		@Session() session: UserSession<Auth>,
		@Param('code') code: string,
		@Body(new ZodValidationPipe(qrTokenDetailsSchema)) data: QrTokenDetailsData,
	) {
		return this.qrTokenUseCases.activate(code, session.user.id, data)
	}

	@Post(':code/contact')
	@AllowAnonymous()
	@ApiZodBody(contactOwnerSchema)
	async contactOwner(
		@Param('code') code: string,
		@Body(new ZodValidationPipe(contactOwnerSchema)) data: ContactOwnerData,
	) {
		const token = await this.qrTokenUseCases.getByCode(code)

		if (token.status !== 'activated' || !token.userId) {
			throw new BadRequestException("Ce sticker n'est pas encore activé")
		}

		await this.createContactMessage.execute({
			name: data.name,
			email: data.email,
			phone: data.phone,
			subject: `Sticker QR — ${token.label ?? token.code}`,
			message: data.message,
			qrTokenCode: token.code,
			recipientUserId: token.userId,
		})

		await this.createNotification.execute({
			type: 'qr_scan',
			title: "Quelqu'un a trouvé votre objet",
			message: `${data.name} vous a contacté via votre sticker QR.`,
			link: '/account/stickers',
			userId: token.userId,
		})

		return { success: true }
	}

	@Patch(':code')
	@ApiZodBody(qrTokenDetailsSchema)
	update(
		@Session() session: UserSession<Auth>,
		@Param('code') code: string,
		@Body(new ZodValidationPipe(qrTokenDetailsSchema)) data: QrTokenDetailsData,
	) {
		return this.qrTokenUseCases.updateDetails(code, session.user.id, data)
	}

	@Post(':code/revoke')
	revoke(@Session() session: UserSession<Auth>, @Param('code') code: string) {
		return this.qrTokenUseCases.revoke(code, session.user.id)
	}
}
