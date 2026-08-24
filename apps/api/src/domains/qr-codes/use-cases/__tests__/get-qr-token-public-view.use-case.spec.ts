import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildRepository } from '../../__tests__/qr-token.fixture'
import { QrTokenNotFoundError } from '../../errors/qr-token.errors'
import type { QrTokenRepository } from '../../repository/qr-token.repository'
import { GetQrTokenPublicViewUseCase } from '../get-qr-token-public-view.use-case'

describe('GetQrTokenPublicViewUseCase', () => {
	let repository: QrTokenRepository
	let useCase: GetQrTokenPublicViewUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new GetQrTokenPublicViewUseCase(repository)
	})

	it('returns the public view', async () => {
		const view = {
			status: 'activated' as const,
			ownerFirstName: 'Konan',
			label: 'Mes clés',
			linkedObject: 'Trousseau',
		}
		vi.mocked(repository.findPublicView).mockResolvedValue(view)

		expect(await useCase.execute('RCI-ABC123')).toEqual(view)
	})

	it('throws when the token does not exist', async () => {
		vi.mocked(repository.findPublicView).mockResolvedValue(null)

		await expect(useCase.execute('RCI-NOPE')).rejects.toThrow(
			QrTokenNotFoundError,
		)
	})
})
