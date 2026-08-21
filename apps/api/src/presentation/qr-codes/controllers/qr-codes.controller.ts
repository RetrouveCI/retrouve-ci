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
import type { Auth } from '@/infrastructure/auth/auth.config'
import { QrTokenUseCases } from '@/domains/qr-codes/use-cases/qr-token.use-cases'
import { ContactMessageUseCases } from '@/domains/contact-messages/use-cases/contact-message.use-cases'
import { NotificationUseCases } from '@/domains/notifications/use-cases/notification.use-cases'
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe'

@ApiTags('qr-codes')
@ApiBearerAuth()
@Controller('qr-codes')
export class QrCodesController {
	constructor(
		private readonly qrTokenUseCases: QrTokenUseCases,
		private readonly contactMessageUseCases: ContactMessageUseCases,
		private readonly notificationUseCases: NotificationUseCases,
	) {}

	@Post('generate')
	@Roles(['admin'])
	generate(
		@Body(new ZodValidationPipe(generateQrTokensSchema))
		data: GenerateQrTokensData,
	) {
		return this.qrTokenUseCases.generateBatch(data)
	}

	@Get()
	@Roles(['admin'])
	list(
		@Query(new ZodValidationPipe(listQrTokensFilterSchema))
		filter: ListQrTokensFilterData,
	) {
		return this.qrTokenUseCases.list(filter)
	}

	@Get('mine')
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
	activate(
		@Session() session: UserSession<Auth>,
		@Param('code') code: string,
		@Body(new ZodValidationPipe(qrTokenDetailsSchema)) data: QrTokenDetailsData,
	) {
		return this.qrTokenUseCases.activate(code, session.user.id, data)
	}

	@Post(':code/contact')
	@AllowAnonymous()
	async contactOwner(
		@Param('code') code: string,
		@Body(new ZodValidationPipe(contactOwnerSchema)) data: ContactOwnerData,
	) {
		const token = await this.qrTokenUseCases.getByCode(code)

		if (token.status !== 'activated' || !token.userId) {
			throw new BadRequestException("Ce sticker n'est pas encore activé")
		}

		await this.contactMessageUseCases.create({
			name: data.name,
			email: data.email,
			phone: data.phone,
			subject: `Sticker QR — ${token.label ?? token.code}`,
			message: data.message,
			qrTokenCode: token.code,
			recipientUserId: token.userId,
		})

		await this.notificationUseCases.create({
			type: 'qr_scan',
			title: "Quelqu'un a trouvé votre objet",
			message: `${data.name} vous a contacté via votre sticker QR.`,
			link: '/account/stickers',
			userId: token.userId,
		})

		return { success: true }
	}

	@Patch(':code')
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
