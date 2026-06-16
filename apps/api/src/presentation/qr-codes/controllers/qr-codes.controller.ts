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
import { AllowAnonymous, Roles, Session } from '@thallesp/nestjs-better-auth'
import type { UserSession } from '@thallesp/nestjs-better-auth'
import type { auth } from '@/infrastructure/auth/auth.config'
import { QrTokenUseCases } from '@/domains/qr-codes/use-cases/qr-token.use-cases'
import { ContactMessageUseCases } from '@/domains/contact-messages/use-cases/contact-message.use-cases'
import { NotificationUseCases } from '@/domains/notifications/use-cases/notification.use-cases'
import { ActivateQrTokenDto } from '../dto/activate-qr-token.dto'
import { ContactOwnerDto } from '../dto/contact-owner.dto'
import { GenerateQrTokensDto } from '../dto/generate-qr-tokens.dto'
import { ListQrTokensQueryDto } from '../dto/list-qr-tokens.query.dto'
import { UpdateQrTokenDto } from '../dto/update-qr-token.dto'

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
	generate(@Body() dto: GenerateQrTokensDto) {
		return this.qrTokenUseCases.generateBatch(dto)
	}

	@Get()
	@Roles(['admin'])
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
		@Session() session: UserSession<typeof auth>,
		@Param('code') code: string,
		@Body() dto: ActivateQrTokenDto,
	) {
		return this.qrTokenUseCases.activate(code, session.user.id, dto)
	}

	@Post(':code/contact')
	@AllowAnonymous()
	async contactOwner(
		@Param('code') code: string,
		@Body() dto: ContactOwnerDto,
	) {
		const token = await this.qrTokenUseCases.getByCode(code)

		if (token.status !== 'activated' || !token.userId) {
			throw new BadRequestException('Ce sticker n\'est pas encore activé')
		}

		await this.contactMessageUseCases.create({
			name: dto.name,
			email: dto.email,
			phone: dto.phone,
			subject: `Sticker QR — ${token.label ?? token.code}`,
			message: dto.message,
			qrTokenCode: token.code,
			recipientUserId: token.userId,
		})

		await this.notificationUseCases.create({
			type: 'qr_scan',
			title: 'Quelqu\'un a trouvé votre objet',
			message: `${dto.name} vous a contacté via votre sticker QR.`,
			link: '/account/stickers',
			userId: token.userId,
		})

		return { success: true }
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
