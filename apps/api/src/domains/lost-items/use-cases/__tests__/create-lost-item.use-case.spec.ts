import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	buildLostItem,
	buildRepository,
} from '../../__tests__/lost-item.fixture'
import type { LinkQrTokenToLostItemUseCase } from '@/domains/qr-codes/use-cases/link-qr-token-to-lost-item.use-case'
import type { LostItemRepository } from '../../repository/lost-item.repository'
import type { CreateLostItemData } from '../../types/lost-item.types'
import { CreateLostItemUseCase } from '../create-lost-item.use-case'

const data: CreateLostItemData = {
	type: 'lost',
	category: 'phone',
	title: 'iPhone 13 perdu',
	description: 'Perdu près du marché de Cocody, coque noire avec autocollant',
	ville: 'Abidjan',
	eventDate: new Date('2026-01-01'),
	contactName: 'Jean Dupont',
	contactWhatsapp: '+2250700000000',
	userId: 'user-1',
}

describe('CreateLostItemUseCase', () => {
	let repository: LostItemRepository
	let linkQrToken: LinkQrTokenToLostItemUseCase
	let useCase: CreateLostItemUseCase

	beforeEach(() => {
		repository = buildRepository()
		linkQrToken = {
			execute: vi.fn().mockResolvedValue(undefined),
		} as unknown as LinkQrTokenToLostItemUseCase
		useCase = new CreateLostItemUseCase(repository, linkQrToken)
	})

	it('creates the lost item from the data it is given', async () => {
		const created = buildLostItem()
		vi.mocked(repository.create).mockResolvedValue(created)

		expect(await useCase.execute(data)).toEqual(created)
		expect(repository.create).toHaveBeenCalledWith(data)
		expect(linkQrToken.execute).not.toHaveBeenCalled()
	})

	// The code names the sticker; the listing's id only exists once it is written.
	it('links the named sticker once the listing has an id', async () => {
		const created = buildLostItem({ id: 'lost-item-9' })
		vi.mocked(repository.create).mockResolvedValue(created)

		await useCase.execute({ ...data, stickerCode: 'RCI-ABC123' })

		expect(linkQrToken.execute).toHaveBeenCalledWith({
			code: 'RCI-ABC123',
			userId: 'user-1',
			lostItemId: 'lost-item-9',
		})
	})

	// `stickerCode` is not a column: it must not reach the repository.
	it('keeps the sticker code out of what is written', async () => {
		vi.mocked(repository.create).mockResolvedValue(buildLostItem())

		await useCase.execute({ ...data, stickerCode: 'RCI-ABC123' })

		expect(repository.create).toHaveBeenCalledWith(data)
	})

	// Failing here would show an error for a listing that was in fact created.
	it('publishes anyway when the link is refused', async () => {
		const created = buildLostItem()
		vi.mocked(repository.create).mockResolvedValue(created)
		vi.mocked(linkQrToken.execute).mockRejectedValue(new Error('forbidden'))

		expect(await useCase.execute({ ...data, stickerCode: 'RCI-NOPE' })).toEqual(
			created,
		)
	})
})
