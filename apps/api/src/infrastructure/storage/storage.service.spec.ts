import {
	BadRequestException,
	PayloadTooLargeException,
	UnsupportedMediaTypeException,
} from '@nestjs/common'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
	configureCloudinary,
	uploadImageBuffer,
} from '@/libs/storage/cloudinary'
import {
	MAX_PHOTO_SIZE,
	StorageService,
	type UploadFileInput,
} from './storage.service'

vi.mock('@/libs/storage/cloudinary', () => ({
	configureCloudinary: vi.fn(),
	uploadImageBuffer: vi.fn(),
}))

function buildFile(overrides: Partial<UploadFileInput> = {}): UploadFileInput {
	return {
		buffer: Buffer.from('image-bytes'),
		mimetype: 'image/jpeg',
		size: 1024,
		...overrides,
	}
}

describe('StorageService', () => {
	let service: StorageService

	beforeEach(() => {
		vi.clearAllMocks()
		process.env['CLOUDINARY_CLOUD_NAME'] = 'demo'
		process.env['CLOUDINARY_API_KEY'] = 'key'
		process.env['CLOUDINARY_API_SECRET'] = 'secret'
		process.env['CLOUDINARY_FOLDER'] = 'test-folder'
		service = new StorageService()
	})

	afterEach(() => {
		delete process.env['CLOUDINARY_CLOUD_NAME']
		delete process.env['CLOUDINARY_API_KEY']
		delete process.env['CLOUDINARY_API_SECRET']
		delete process.env['CLOUDINARY_FOLDER']
	})

	describe('uploadLostItemPhoto', () => {
		it('uploads the buffer to the configured folder and returns the secure url', async () => {
			vi.mocked(uploadImageBuffer).mockResolvedValue({
				url: 'https://cdn.test/photo.jpg',
				publicId: 'photo',
			})

			const file = buildFile()
			const url = await service.uploadLostItemPhoto(file)

			expect(configureCloudinary).toHaveBeenCalledWith({
				cloudName: 'demo',
				apiKey: 'key',
				apiSecret: 'secret',
				folder: 'test-folder',
			})
			expect(uploadImageBuffer).toHaveBeenCalledWith(file.buffer, {
				folder: 'test-folder',
			})
			expect(url).toBe('https://cdn.test/photo.jpg')
		})

		it('configures Cloudinary only once across uploads', async () => {
			vi.mocked(uploadImageBuffer).mockResolvedValue({
				url: 'https://cdn.test/photo.jpg',
				publicId: 'photo',
			})

			await service.uploadLostItemPhoto(buildFile())
			await service.uploadLostItemPhoto(buildFile())

			expect(configureCloudinary).toHaveBeenCalledTimes(1)
		})

		it('rejects a request without a file buffer', async () => {
			await expect(
				service.uploadLostItemPhoto(buildFile({ buffer: undefined })),
			).rejects.toBeInstanceOf(BadRequestException)
			expect(uploadImageBuffer).not.toHaveBeenCalled()
		})

		it('rejects an unsupported mime type', async () => {
			await expect(
				service.uploadLostItemPhoto(buildFile({ mimetype: 'application/pdf' })),
			).rejects.toBeInstanceOf(UnsupportedMediaTypeException)
			expect(uploadImageBuffer).not.toHaveBeenCalled()
		})

		it('rejects a file larger than the max size', async () => {
			await expect(
				service.uploadLostItemPhoto(buildFile({ size: MAX_PHOTO_SIZE + 1 })),
			).rejects.toBeInstanceOf(PayloadTooLargeException)
			expect(uploadImageBuffer).not.toHaveBeenCalled()
		})

		it('throws when Cloudinary configuration is missing', async () => {
			delete process.env['CLOUDINARY_CLOUD_NAME']

			await expect(service.uploadLostItemPhoto(buildFile())).rejects.toThrow(
				/Configuration Cloudinary manquante/,
			)
			expect(uploadImageBuffer).not.toHaveBeenCalled()
		})
	})
})
