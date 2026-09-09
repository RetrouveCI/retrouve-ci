import { BadRequestException, PayloadTooLargeException } from '@nestjs/common'
import type { FastifyRequest } from 'fastify'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Auth } from '@/infrastructures/auth/auth.config'
import { StorageService } from '@/infrastructures/storage/storage.service'
import { AccountBudgetExceededError } from '@/shared/rate-limit/account-budget.error'
import { AccountBudget } from '@/shared/rate-limit/account-budget.service'
import { UPLOAD_PER_USER } from '@/shared/rate-limit/rate-limit.policy'
import type { UserSession } from '@thallesp/nestjs-better-auth'
import { UploadsController } from '../uploads.controller'

const SESSION = { user: { id: 'user-1' } } as UserSession<Auth>

function buildBudget(): AccountBudget {
	return { require: vi.fn() } as unknown as AccountBudget
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
	let budget: AccountBudget
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
				controller.uploadLostItemPhoto(SESSION, buildRequest(undefined)),
			).rejects.toBeInstanceOf(BadRequestException)
			expect(storageService.uploadLostItemPhoto).not.toHaveBeenCalled()
		})

		it('throws when the file was truncated by the size limit', async () => {
			const file = buildFile({ file: { truncated: true } })

			await expect(
				controller.uploadLostItemPhoto(SESSION, buildRequest(file)),
			).rejects.toBeInstanceOf(PayloadTooLargeException)
			expect(storageService.uploadLostItemPhoto).not.toHaveBeenCalled()
		})
	})

	describe('the upload budget', () => {
		it('is asked for the session owner under the upload limit', async () => {
			await controller.uploadLostItemPhoto(SESSION, buildRequest(buildFile()))

			expect(budget.require).toHaveBeenCalledWith(UPLOAD_PER_USER, 'user-1')
		})

		// A refusal must cost nothing: neither read nor stored once it is spent.
		// The 429 itself is `AccountBudgetFilter`'s job, so the controller's part
		// is to let the refusal out untouched, before it touches the file.
		it('lets the refusal out before reading the file', async () => {
			vi.mocked(budget.require).mockRejectedValue(
				new AccountBudgetExceededError(UPLOAD_PER_USER.message, 900),
			)
			const request = buildRequest(buildFile())

			await expect(
				controller.uploadLostItemPhoto(SESSION, request),
			).rejects.toBeInstanceOf(AccountBudgetExceededError)
			expect(request.file).not.toHaveBeenCalled()
			expect(storageService.uploadLostItemPhoto).not.toHaveBeenCalled()
		})

		// A store that cannot answer is not a refusal: `AccountBudget` fails open,
		// and anything else coming out of it is a bug worth surfacing.
		it('swallows nothing that is not a refusal', async () => {
			vi.mocked(budget.require).mockRejectedValue(new Error('redis exploded'))

			await expect(
				controller.uploadLostItemPhoto(SESSION, buildRequest(buildFile())),
			).rejects.toThrow('redis exploded')
		})
	})
})
