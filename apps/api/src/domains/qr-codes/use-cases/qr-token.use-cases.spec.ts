import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	QrTokenAlreadyActivatedError,
	QrTokenForbiddenError,
	QrTokenNotFoundError,
	QrTokenRevokedError,
} from '../errors/qr-token.errors'
import type { QrToken } from '../models/qr-token.model'
import type { QrTokenRepository } from '../repository/qr-token.repository'
import { QrTokenUseCases } from './qr-token.use-cases'

function buildQrToken(overrides: Partial<QrToken> = {}): QrToken {
	return {
		id: 'qr-token-1',
		code: 'RCI-ABC123',
		status: 'generated',
		batch: 'batch-1',
		label: null,
		linkedObject: null,
		userId: null,
		createdAt: new Date('2026-01-01'),
		activatedAt: null,
		revokedAt: null,
		...overrides,
	}
}

function buildRepository(): QrTokenRepository {
	return {
		createMany: vi.fn(),
		findByCode: vi.fn(),
		findPublicView: vi.fn(),
		activate: vi.fn(),
		revoke: vi.fn(),
		updateDetails: vi.fn(),
		list: vi.fn(),
	}
}

describe('QrTokenUseCases', () => {
	let repository: QrTokenRepository
	let useCases: QrTokenUseCases

	beforeEach(() => {
		repository = buildRepository()
		useCases = new QrTokenUseCases(repository)
	})

	describe('generateBatch', () => {
		it('generates the requested number of codes', async () => {
			const created = [buildQrToken(), buildQrToken({ id: 'qr-token-2' })]
			vi.mocked(repository.createMany).mockResolvedValue(created)

			const result = await useCases.generateBatch({
				count: 2,
				batch: 'batch-1',
			})

			expect(repository.createMany).toHaveBeenCalledWith(
				expect.arrayContaining([expect.stringMatching(/^RCI-/)]),
				'batch-1',
			)
			expect(vi.mocked(repository.createMany).mock.calls[0]?.[0]).toHaveLength(
				2,
			)
			expect(result).toEqual(created)
		})

		it('throws when the count is invalid', async () => {
			await expect(useCases.generateBatch({ count: 0 })).rejects.toThrow()
			expect(repository.createMany).not.toHaveBeenCalled()
		})
	})

	describe('getByCode', () => {
		it('returns the qr token when found', async () => {
			const qrToken = buildQrToken()
			vi.mocked(repository.findByCode).mockResolvedValue(qrToken)

			const result = await useCases.getByCode('RCI-ABC123')

			expect(result).toEqual(qrToken)
		})

		it('throws QrTokenNotFoundError when the token does not exist', async () => {
			vi.mocked(repository.findByCode).mockResolvedValue(null)

			await expect(useCases.getByCode('missing')).rejects.toThrow(
				QrTokenNotFoundError,
			)
		})
	})

	describe('activate', () => {
		it('activates a generated token', async () => {
			const qrToken = buildQrToken()
			const activated = buildQrToken({ status: 'activated', userId: 'user-1' })
			vi.mocked(repository.findByCode).mockResolvedValue(qrToken)
			vi.mocked(repository.activate).mockResolvedValue(activated)

			const result = await useCases.activate('RCI-ABC123', 'user-1', {
				label: 'Mes clés',
			})

			expect(repository.activate).toHaveBeenCalledWith('RCI-ABC123', 'user-1', {
				label: 'Mes clés',
			})
			expect(result).toEqual(activated)
		})

		it('throws QrTokenAlreadyActivatedError when already activated', async () => {
			const qrToken = buildQrToken({ status: 'activated' })
			vi.mocked(repository.findByCode).mockResolvedValue(qrToken)

			await expect(
				useCases.activate('RCI-ABC123', 'user-1', {}),
			).rejects.toThrow(QrTokenAlreadyActivatedError)
			expect(repository.activate).not.toHaveBeenCalled()
		})

		it('throws QrTokenRevokedError when revoked', async () => {
			const qrToken = buildQrToken({ status: 'revoked' })
			vi.mocked(repository.findByCode).mockResolvedValue(qrToken)

			await expect(
				useCases.activate('RCI-ABC123', 'user-1', {}),
			).rejects.toThrow(QrTokenRevokedError)
			expect(repository.activate).not.toHaveBeenCalled()
		})

		it('throws QrTokenNotFoundError when the token does not exist', async () => {
			vi.mocked(repository.findByCode).mockResolvedValue(null)

			await expect(useCases.activate('missing', 'user-1', {})).rejects.toThrow(
				QrTokenNotFoundError,
			)
		})
	})

	describe('revoke', () => {
		it('revokes an existing token owned by the user', async () => {
			const qrToken = buildQrToken({ status: 'activated', userId: 'user-1' })
			const revoked = buildQrToken({ status: 'revoked', userId: 'user-1' })
			vi.mocked(repository.findByCode).mockResolvedValue(qrToken)
			vi.mocked(repository.revoke).mockResolvedValue(revoked)

			const result = await useCases.revoke('RCI-ABC123', 'user-1')

			expect(repository.revoke).toHaveBeenCalledWith('RCI-ABC123')
			expect(result).toEqual(revoked)
		})

		it('throws QrTokenForbiddenError when the user does not own the token', async () => {
			const qrToken = buildQrToken({ status: 'activated', userId: 'user-1' })
			vi.mocked(repository.findByCode).mockResolvedValue(qrToken)

			await expect(useCases.revoke('RCI-ABC123', 'user-2')).rejects.toThrow(
				QrTokenForbiddenError,
			)
			expect(repository.revoke).not.toHaveBeenCalled()
		})

		it('throws QrTokenNotFoundError when the token does not exist', async () => {
			vi.mocked(repository.findByCode).mockResolvedValue(null)

			await expect(useCases.revoke('missing', 'user-1')).rejects.toThrow(
				QrTokenNotFoundError,
			)
			expect(repository.revoke).not.toHaveBeenCalled()
		})
	})

	describe('updateDetails', () => {
		it('updates label and linkedObject for the owner', async () => {
			const qrToken = buildQrToken({ status: 'activated', userId: 'user-1' })
			const updated = buildQrToken({
				status: 'activated',
				userId: 'user-1',
				label: 'Nouveau nom',
			})
			vi.mocked(repository.findByCode).mockResolvedValue(qrToken)
			vi.mocked(repository.updateDetails).mockResolvedValue(updated)

			const result = await useCases.updateDetails('RCI-ABC123', 'user-1', {
				label: 'Nouveau nom',
			})

			expect(repository.updateDetails).toHaveBeenCalledWith('RCI-ABC123', {
				label: 'Nouveau nom',
			})
			expect(result).toEqual(updated)
		})

		it('throws QrTokenForbiddenError when the user does not own the token', async () => {
			const qrToken = buildQrToken({ status: 'activated', userId: 'user-1' })
			vi.mocked(repository.findByCode).mockResolvedValue(qrToken)

			await expect(
				useCases.updateDetails('RCI-ABC123', 'user-2', { label: 'X' }),
			).rejects.toThrow(QrTokenForbiddenError)
			expect(repository.updateDetails).not.toHaveBeenCalled()
		})

		it('throws QrTokenNotFoundError when the token does not exist', async () => {
			vi.mocked(repository.findByCode).mockResolvedValue(null)

			await expect(
				useCases.updateDetails('missing', 'user-1', { label: 'X' }),
			).rejects.toThrow(QrTokenNotFoundError)
			expect(repository.updateDetails).not.toHaveBeenCalled()
		})
	})

	describe('list', () => {
		it('delegates to the repository', async () => {
			const response = {
				items: [buildQrToken()],
				total: 1,
				page: 1,
				pageSize: 20,
			}
			vi.mocked(repository.list).mockResolvedValue(response)

			const filter = { page: 1, pageSize: 20 }
			const result = await useCases.list(filter)

			expect(repository.list).toHaveBeenCalledWith(filter)
			expect(result).toEqual(response)
		})
	})

	describe('listMine', () => {
		it('delegates to the repository with the user id injected', async () => {
			const response = {
				items: [buildQrToken({ userId: 'user-1', status: 'activated' })],
				total: 1,
				page: 1,
				pageSize: 20,
			}
			vi.mocked(repository.list).mockResolvedValue(response)

			const filter = { page: 1, pageSize: 20 }
			const result = await useCases.listMine('user-1', filter)

			expect(repository.list).toHaveBeenCalledWith({
				...filter,
				userId: 'user-1',
			})
			expect(result).toEqual(response)
		})
	})
})
