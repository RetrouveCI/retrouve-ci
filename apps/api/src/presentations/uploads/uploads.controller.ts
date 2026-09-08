import {
	BadRequestException,
	Controller,
	HttpException,
	HttpStatus,
	PayloadTooLargeException,
	Post,
	Req,
	Res,
} from '@nestjs/common'
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import { Session, type UserSession } from '@thallesp/nestjs-better-auth'
import type { FastifyReply, FastifyRequest } from 'fastify'
import type { Auth } from '@/infrastructures/auth/auth.config'
import { StorageService } from '@/infrastructures/storage/storage.service'
import { UploadBudgetExceededError } from '@/infrastructures/storage/upload-budget.error'
import { UploadBudget } from '@/infrastructures/storage/upload-budget.service'

@ApiTags('uploads')
@ApiBearerAuth()
@Controller('uploads')
export class UploadsController {
	constructor(
		private readonly storageService: StorageService,
		private readonly uploadBudget: UploadBudget,
	) {}

	@Post('lost-item-photo')
	@ApiConsumes('multipart/form-data')
	async uploadLostItemPhoto(
		@Session() session: UserSession<Auth>,
		@Req() request: FastifyRequest,
		// `passthrough`, so Nest still sends the return value: the reply is
		// touched only to carry `Retry-After` on a refusal.
		@Res({ passthrough: true }) reply: FastifyReply,
	) {
		// Before the file is read, let alone stored: a refusal costs nothing.
		await this.requireBudget(session.user.id, reply)

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

	// The same body and the same `Retry-After` the request hook answers with, so
	// a front reads one shape whichever ceiling refused it.
	private async requireBudget(
		userId: string,
		reply: FastifyReply,
	): Promise<void> {
		try {
			await this.uploadBudget.require(userId)
		} catch (error) {
			if (!(error instanceof UploadBudgetExceededError)) throw error

			reply.header('Retry-After', String(error.retryAfterSeconds))

			throw new HttpException(
				{
					statusCode: HttpStatus.TOO_MANY_REQUESTS,
					message: error.message,
					error: 'Too Many Requests',
				},
				HttpStatus.TOO_MANY_REQUESTS,
				{ cause: error },
			)
		}
	}
}
