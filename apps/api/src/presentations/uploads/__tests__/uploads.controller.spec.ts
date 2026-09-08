import {
	BadRequestException,
	HttpException,
	PayloadTooLargeException,
} from '@nestjs/common'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Auth } from '@/infrastructures/auth/auth.config'
import { StorageService } from '@/infrastructures/storage/storage.service'
import { UploadBudgetExceededError } from '@/infrastructures/storage/upload-budget.error'
import { UploadBudget } from '@/infrastructures/storage/upload-budget.service'
import type { UserSession } from '@thallesp/nestjs-better-auth'
import { UploadsController } from '../uploads.controller'

const SESSION = { user: { id: 'user-1' } } as UserSession<Auth>

function buildBudget(): UploadBudget {
	return { require: vi.fn() } as unknown as UploadBudget
}

function buildReply() {
	const header = vi.fn()

	return { reply: { header } as unknown as FastifyReply, header }
}

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
	let budget: UploadBudget
	let controller: UploadsController

	beforeEach(() => {
		storageService = buildStorageService()
		budget = buildBudget()
		controller = new UploadsController(storageService, budget)
	})

	describe('uploadLostItemPhoto', () => {
		it('reads the file buffer, delegates to the storage service and returns the url', async () => {
			const file = buildFile()
			vi.mocked(storageService.uploadLostItemPhoto).mockResolvedValue(
				'https://cdn.test/photo.jpg',
			)

			const result = await controller.uploadLostItemPhoto(
				SESSION,
				buildRequest(file),
				buildReply().reply,
			)

			expect(storageService.uploadLostItemPhoto).toHaveBeenCalledWith({
				buffer: Buffer.from('image-bytes'),
				mimetype: 'image/jpeg',
				size: Buffer.from('image-bytes').length,
			})
			expect(result).toEqual({ url: 'https://cdn.test/photo.jpg' })
		})

		it('throws when no file is provided', async () => {
			await expect(
				controller.uploadLostItemPhoto(
					SESSION,
					buildRequest(undefined),
					buildReply().reply,
				),
			).rejects.toBeInstanceOf(BadRequestException)
			expect(storageService.uploadLostItemPhoto).not.toHaveBeenCalled()
		})

		it('throws when the file was truncated by the size limit', async () => {
			const file = buildFile({ file: { truncated: true } })

			await expect(
				controller.uploadLostItemPhoto(
					SESSION,
					buildRequest(file),
					buildReply().reply,
				),
			).rejects.toBeInstanceOf(PayloadTooLargeException)
			expect(storageService.uploadLostItemPhoto).not.toHaveBeenCalled()
		})
	})

	describe('the upload budget', () => {
		it('is asked for the session owner, not for the request', async () => {
			await controller.uploadLostItemPhoto(
				SESSION,
				buildRequest(buildFile()),
				buildReply().reply,
			)

			expect(budget.require).toHaveBeenCalledWith('user-1')
		})

		// A refusal must cost nothing: neither read nor stored once it is spent.
		it('refuses with a 429 before reading the file', async () => {
			vi.mocked(budget.require).mockRejectedValue(
				new UploadBudgetExceededError(900),
			)
			const request = buildRequest(buildFile())
			const { reply, header } = buildReply()

			const thrown: unknown = await controller
				.uploadLostItemPhoto(SESSION, request, reply)
				.catch((error: unknown) => error)

			expect(thrown).toBeInstanceOf(HttpException)
			expect((thrown as HttpException).getStatus()).toBe(429)
			expect((thrown as HttpException).getResponse()).toMatchObject({
				message:
					'Trop de photos envoyées pour ce compte. Merci de patienter avant de réessayer.',
			})
			expect(header).toHaveBeenCalledWith('Retry-After', '900')
			expect(request.file).not.toHaveBeenCalled()
			expect(storageService.uploadLostItemPhoto).not.toHaveBeenCalled()
		})

		// A store that cannot answer is not a refusal: `UploadBudget` fails open,
		// and anything else coming out of it is a bug worth surfacing.
		it('lets a failure that is not a refusal through', async () => {
			vi.mocked(budget.require).mockRejectedValue(new Error('redis exploded'))

			await expect(
				controller.uploadLostItemPhoto(
					SESSION,
					buildRequest(buildFile()),
					buildReply().reply,
				),
			).rejects.toThrow('redis exploded')
		})
	})
})
