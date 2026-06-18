import { BadRequestException, PayloadTooLargeException } from '@nestjs/common'
import type { FastifyRequest } from 'fastify'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { StorageService } from '@/infrastructure/storage/storage.service'
import { UploadsController } from './uploads.controller'

function buildStorageService(): StorageService {
	return {
		uploadLostItemPhoto: vi.fn(),
	} as unknown as StorageService
}

interface MultipartFileMock {
	mimetype: string
	file: { truncated: boolean }
	toBuffer: () => Promise<Buffer>
}

function buildRequest(file: MultipartFileMock | undefined): FastifyRequest {
	return {
		file: vi.fn().mockResolvedValue(file),
	} as unknown as FastifyRequest
}

function buildFile(
	overrides: Partial<MultipartFileMock> = {},
): MultipartFileMock {
	return {
		mimetype: 'image/jpeg',
		file: { truncated: false },
		toBuffer: vi.fn().mockResolvedValue(Buffer.from('image-bytes')),
		...overrides,
	}
}

describe('UploadsController', () => {
	let storageService: StorageService
	let controller: UploadsController

	beforeEach(() => {
		storageService = buildStorageService()
		controller = new UploadsController(storageService)
	})

	describe('uploadLostItemPhoto', () => {
		it('reads the file buffer, delegates to the storage service and returns the url', async () => {
			const file = buildFile()
			vi.mocked(storageService.uploadLostItemPhoto).mockResolvedValue(
				'https://cdn.test/photo.jpg',
			)

			const result = await controller.uploadLostItemPhoto(buildRequest(file))

			expect(storageService.uploadLostItemPhoto).toHaveBeenCalledWith({
				buffer: Buffer.from('image-bytes'),
				mimetype: 'image/jpeg',
				size: Buffer.from('image-bytes').length,
			})
			expect(result).toEqual({ url: 'https://cdn.test/photo.jpg' })
		})

		it('throws when no file is provided', async () => {
			await expect(
				controller.uploadLostItemPhoto(buildRequest(undefined)),
			).rejects.toBeInstanceOf(BadRequestException)
			expect(storageService.uploadLostItemPhoto).not.toHaveBeenCalled()
		})

		it('throws when the file was truncated by the size limit', async () => {
			const file = buildFile({ file: { truncated: true } })

			await expect(
				controller.uploadLostItemPhoto(buildRequest(file)),
			).rejects.toBeInstanceOf(PayloadTooLargeException)
			expect(storageService.uploadLostItemPhoto).not.toHaveBeenCalled()
		})
	})
})
