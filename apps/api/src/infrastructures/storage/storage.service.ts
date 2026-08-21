import {
	BadRequestException,
	Injectable,
	PayloadTooLargeException,
	UnsupportedMediaTypeException,
} from '@nestjs/common'
import {
	configureCloudinary,
	uploadImageBuffer,
} from '@/libs/storage/cloudinary'
import { loadStorageConfig, type StorageConfig } from './storage.config'

export const MAX_PHOTO_SIZE = 5 * 1024 * 1024 // 5 Mo
export const ALLOWED_PHOTO_MIME_TYPES = [
	'image/jpeg',
	'image/png',
	'image/webp',
]

export interface UploadFileInput {
	buffer?: Buffer
	mimetype: string
	size?: number
}

@Injectable()
export class StorageService {
	private config: StorageConfig | null = null

	async uploadLostItemPhoto(file: UploadFileInput): Promise<string> {
		this.validatePhoto(file)

		const config = this.ensureConfigured()
		const { url } = await uploadImageBuffer(file.buffer as Buffer, {
			folder: config.folder,
		})

		return url
	}

	private validatePhoto(file: UploadFileInput): void {
		if (!file.buffer) {
			throw new BadRequestException('Aucun fichier reçu')
		}

		if (!ALLOWED_PHOTO_MIME_TYPES.includes(file.mimetype)) {
			throw new UnsupportedMediaTypeException(
				'Format non supporté : utilisez une image JPEG, PNG ou WebP',
			)
		}

		if ((file.size ?? file.buffer.length) > MAX_PHOTO_SIZE) {
			throw new PayloadTooLargeException(
				'Image trop volumineuse : 5 Mo maximum',
			)
		}
	}

	private ensureConfigured(): StorageConfig {
		if (!this.config) {
			this.config = loadStorageConfig()
			configureCloudinary(this.config)
		}

		return this.config
	}
}
