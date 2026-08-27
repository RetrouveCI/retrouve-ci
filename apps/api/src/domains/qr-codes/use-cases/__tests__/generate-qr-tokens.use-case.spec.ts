import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildQrToken, buildRepository } from '../../__tests__/qr-token.fixture'
import type { QrTokenRepository } from '../../repository/qr-token.repository'
import { GenerateQrTokensUseCase } from '../generate-qr-tokens.use-case'

describe('GenerateQrTokensUseCase', () => {
	let repository: QrTokenRepository
	let useCase: GenerateQrTokensUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new GenerateQrTokensUseCase(repository)
	})

	it('generates the requested number of prefixed codes', async () => {
		const created = [buildQrToken(), buildQrToken({ id: 'qr-token-2' })]
		vi.mocked(repository.createMany).mockResolvedValue(created)

		const result = await useCase.execute({ count: 2, batch: 'batch-1' })

		expect(repository.createMany).toHaveBeenCalledWith(
			expect.arrayContaining([expect.stringMatching(/^RCI-/)]),
			'batch-1',
		)
		expect(vi.mocked(repository.createMany).mock.calls[0]?.[0]).toHaveLength(2)
		expect(result).toEqual(created)
	})

	it('generates distinct codes', async () => {
		vi.mocked(repository.createMany).mockResolvedValue([])

		await useCase.execute({ count: 25 })

		const codes = vi.mocked(repository.createMany).mock.calls[0]?.[0] ?? []
		expect(new Set(codes).size).toBe(25)
	})
})
