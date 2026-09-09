import {
	BadRequestException,
	Controller,
	PayloadTooLargeException,
	Post,
	Req,
} from '@nestjs/common'
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import { Session, type UserSession } from '@thallesp/nestjs-better-auth'
import type { FastifyRequest } from 'fastify'
import type { Auth } from '@/infrastructures/auth/auth.config'
import { StorageService } from '@/infrastructures/storage/storage.service'
import { AccountBudget } from '@/shared/rate-limit/account-budget.service'
import { UPLOAD_PER_USER } from '@/shared/rate-limit/rate-limit.policy'

@ApiTags('uploads')
@ApiBearerAuth()
@Controller('uploads')
export class UploadsController {
	constructor(
		private readonly storageService: StorageService,
		private readonly accountBudget: AccountBudget,
	) {}

	@Post('lost-item-photo')
	@ApiConsumes('multipart/form-data')
	async uploadLostItemPhoto(
		@Session() session: UserSession<Auth>,
		@Req() request: FastifyRequest,
	) {
		// Before the file is read, let alone stored: a refusal costs nothing.
		// `AccountBudgetFilter` turns it into the hook's own 429.
		await this.accountBudget.require(UPLOAD_PER_USER, session.user.id)

		const file = await request.file()

		if (!file) {
			throw new BadRequestException('Aucun fichier reçu')
		}

		const buffer = await file.toBuffer()

		if (file.file.truncated) {
			throw new PayloadTooLargeException(
				'Image trop volumineuse : 5 Mo maximum',
			)
		}

		const url = await this.storageService.uploadLostItemPhoto({
			buffer,
			mimetype: file.mimetype,
			size: buffer.length,
		})

		return { url }
	}
}
