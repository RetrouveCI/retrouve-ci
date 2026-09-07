import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildQrToken, buildRepository } from '../../__tests__/qr-token.fixture'
import {
	QrTokenForbiddenError,
	QrTokenNotActivatedError,
	QrTokenNotFoundError,
} from '../../errors/qr-token.errors'
import type { QrTokenRepository } from '../../repository/qr-token.repository'
import { LinkQrTokenToLostItemUseCase } from '../link-qr-token-to-lost-item.use-case'

const input = {
	code: 'RCI-ABC123',
	userId: 'owner-1',
	lostItemId: 'lost-item-1',
}

describe('LinkQrTokenToLostItemUseCase', () => {
	let repository: QrTokenRepository
	let useCase: LinkQrTokenToLostItemUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new LinkQrTokenToLostItemUseCase(repository)
	})

	it('points an owned, activated sticker at the listing', async () => {
		vi.mocked(repository.findByCode).mockResolvedValue(
			buildQrToken({ status: 'activated', userId: 'owner-1' }),
		)

		await useCase.execute(input)

		expect(repository.linkToLostItem).toHaveBeenCalledWith(
			'RCI-ABC123',
			'lost-item-1',
		)
	})

	// Without this, a listing points at a stranger's sticker.
	it('refuses a sticker belonging to somebody else', async () => {
		vi.mocked(repository.findByCode).mockResolvedValue(
			buildQrToken({ status: 'activated', userId: 'someone-else' }),
		)

		await expect(useCase.execute(input)).rejects.toBeInstanceOf(
			QrTokenForbiddenError,
		)
		expect(repository.linkToLostItem).not.toHaveBeenCalled()
	})

	it('refuses a sticker with no owner at all', async () => {
		vi.mocked(repository.findByCode).mockResolvedValue(
			buildQrToken({ status: 'generated', userId: null }),
		)

		await expect(useCase.execute(input)).rejects.toBeInstanceOf(
			QrTokenForbiddenError,
		)
	})

	// A sticker nobody can scan would make the link a dead end.
	it.each(['generated', 'revoked'] as const)(
		'refuses an owned but %s sticker',
		async status => {
			vi.mocked(repository.findByCode).mockResolvedValue(
				buildQrToken({ status, userId: 'owner-1' }),
			)

			await expect(useCase.execute(input)).rejects.toBeInstanceOf(
				QrTokenNotActivatedError,
			)
			expect(repository.linkToLostItem).not.toHaveBeenCalled()
		},
	)

	it('refuses a code that names no sticker', async () => {
		vi.mocked(repository.findByCode).mockResolvedValue(null)

		await expect(useCase.execute(input)).rejects.toBeInstanceOf(
			QrTokenNotFoundError,
		)
	})
})
