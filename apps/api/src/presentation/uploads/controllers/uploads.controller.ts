import {
	BadRequestException,
	Controller,
	PayloadTooLargeException,
	Post,
	Req,
} from '@nestjs/common'
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import type { FastifyRequest } from 'fastify'
import { StorageService } from '@/infrastructure/storage/storage.service'

@ApiTags('uploads')
@ApiBearerAuth()
@Controller('uploads')
export class UploadsController {
	constructor(private readonly storageService: StorageService) {}

	@Post('lost-item-photo')
	@ApiConsumes('multipart/form-data')
	async uploadLostItemPhoto(@Req() request: FastifyRequest) {
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
