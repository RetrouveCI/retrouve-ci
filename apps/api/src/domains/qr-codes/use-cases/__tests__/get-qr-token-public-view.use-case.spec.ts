import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildRepository } from '../../__tests__/qr-token.fixture'
import { QrTokenNotFoundError } from '../../errors/qr-token.errors'
import { SCAN_WINDOW_MINUTES } from '../../helpers/should-record-scan'
import type { QrTokenRepository } from '../../repository/qr-token.repository'
import { GetQrTokenPublicViewUseCase } from '../get-qr-token-public-view.use-case'

const view = {
	status: 'activated' as const,
	ownerFirstName: 'Konan',
	label: 'Mes clés',
	linkedObject: 'Trousseau',
	directContact: false,
	lostItem: null,
}

const minutesAgo = (minutes: number) =>
	new Date(Date.now() - minutes * 60 * 1000)

describe('GetQrTokenPublicViewUseCase', () => {
	let repository: QrTokenRepository
	let useCase: GetQrTokenPublicViewUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new GetQrTokenPublicViewUseCase(repository)
	})

	it('returns the public view, and never the trace it keeps', async () => {
		vi.mocked(repository.findPublicView).mockResolvedValue({
			view,
			lastScannedAt: minutesAgo(120),
		})

		const answer = await useCase.execute('RCI-ABC123')

		expect(answer).toEqual(view)
		expect(answer).not.toHaveProperty('lastScannedAt')
	})

	it('throws when the token does not exist', async () => {
		vi.mocked(repository.findPublicView).mockResolvedValue(null)

		await expect(useCase.execute('RCI-NOPE')).rejects.toThrow(
			QrTokenNotFoundError,
		)
		expect(repository.recordScan).not.toHaveBeenCalled()
	})

	it('records the scan the owner will read', async () => {
		vi.mocked(repository.findPublicView).mockResolvedValue({
			view,
			lastScannedAt: null,
		})

		await useCase.execute('RCI-ABC123')

		expect(repository.recordScan).toHaveBeenCalledWith(
			'RCI-ABC123',
			expect.any(Date),
		)
	})

	// `/q/:code` is read by a loader, so a finder keeping the page open would
	// otherwise reset « scanné il y a 2 h » on every reload.
	it('leaves the trace alone inside the window', async () => {
		vi.mocked(repository.findPublicView).mockResolvedValue({
			view,
			lastScannedAt: minutesAgo(SCAN_WINDOW_MINUTES - 1),
		})

		await useCase.execute('RCI-ABC123')

		expect(repository.recordScan).not.toHaveBeenCalled()
	})
})
