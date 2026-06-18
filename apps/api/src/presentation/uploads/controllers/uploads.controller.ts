import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor, type File } from '@nest-lab/fastify-multer'
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import { StorageService } from '@/infrastructure/storage/storage.service'

@ApiTags('uploads')
@ApiBearerAuth()
@Controller('uploads')
export class UploadsController {
	constructor(private readonly storageService: StorageService) {}

	@Post('lost-item-photo')
	@ApiConsumes('multipart/form-data')
	@UseInterceptors(FileInterceptor('photo'))
	async uploadLostItemPhoto(@UploadedFile() photo: File) {
		const url = await this.storageService.uploadLostItemPhoto(photo)

		return { url }
	}
}
