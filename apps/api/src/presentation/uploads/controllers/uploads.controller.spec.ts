import type { File } from '@nest-lab/fastify-multer'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { StorageService } from '@/infrastructure/storage/storage.service'
import { UploadsController } from './uploads.controller'

function buildStorageService(): StorageService {
	return {
		uploadLostItemPhoto: vi.fn(),
	} as unknown as StorageService
}

function buildFile(overrides: Partial<File> = {}): File {
	return {
		fieldname: 'photo',
		originalname: 'photo.jpg',
		encoding: '7bit',
		mimetype: 'image/jpeg',
		size: 1024,
		buffer: Buffer.from('image-bytes'),
		...overrides,
	} as File
}

describe('UploadsController', () => {
	let storageService: StorageService
	let controller: UploadsController

	beforeEach(() => {
		storageService = buildStorageService()
		controller = new UploadsController(storageService)
	})

	describe('uploadLostItemPhoto', () => {
		it('delegates to the storage service and returns the url', async () => {
			const file = buildFile()
			vi.mocked(storageService.uploadLostItemPhoto).mockResolvedValue(
				'https://cdn.test/photo.jpg',
			)

			const result = await controller.uploadLostItemPhoto(file)

			expect(storageService.uploadLostItemPhoto).toHaveBeenCalledWith(file)
			expect(result).toEqual({ url: 'https://cdn.test/photo.jpg' })
		})
	})
})
