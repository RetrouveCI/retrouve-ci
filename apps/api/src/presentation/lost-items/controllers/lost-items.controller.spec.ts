import type { UserSession } from '@thallesp/nestjs-better-auth'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { auth } from '@/infrastructure/auth/auth.config'
import { FIND_MATCHES_JOB } from '@/domains/matching/constants'
import type { LostItem } from '@/domains/lost-items/models/lost-item.model'
import { LostItemUseCases } from '@/domains/lost-items/use-cases/lost-item.use-cases'
import type { CreateLostItemDto } from '../dto/create-lost-item.dto'
import type { ListLostItemsQueryDto } from '../dto/list-lost-items.query.dto'
import type { UpdateLostItemDto } from '../dto/update-lost-item.dto'
import { LostItemsController } from './lost-items.controller'

function buildLostItem(overrides: Partial<LostItem> = {}): LostItem {
	return {
		id: 'lost-item-1',
		type: 'lost',
		category: 'phone',
		title: 'iPhone 13 perdu',
		description: 'Perdu près du marché de Cocody, coque noire avec autocollant',
		ville: 'Abidjan',
		commune: 'Cocody',
		eventDate: new Date('2026-01-01'),
		contactName: 'Jean Dupont',
		contactWhatsapp: '+2250700000000',
		photos: [],
		moderationStatus: 'pending',
		resolutionStatus: 'active',
		views: 0,
		contactsCount: 0,
		userId: 'user-1',
		createdAt: new Date('2026-01-01'),
		updatedAt: new Date('2026-01-01'),
		...overrides,
	}
}

const session = {
	user: { id: 'user-1' },
} as UserSession<typeof auth>

function buildUseCases(): LostItemUseCases {
	return {
		create: vi.fn(),
		getById: vi.fn(),
		view: vi.fn(),
		recordContact: vi.fn(),
		list: vi.fn(),
		listMine: vi.fn(),
		update: vi.fn(),
		moderate: vi.fn(),
		delete: vi.fn(),
	} as unknown as LostItemUseCases
}

function buildMatchingQueue() {
	return { add: vi.fn() }
}

describe('LostItemsController', () => {
	let useCases: LostItemUseCases
	let matchingQueue: ReturnType<typeof buildMatchingQueue>
	let controller: LostItemsController

	beforeEach(() => {
		useCases = buildUseCases()
		matchingQueue = buildMatchingQueue()
		controller = new LostItemsController(useCases, matchingQueue as never)
	})

	describe('create', () => {
		it('converts the eventDate string, forwards the session user id and enqueues a matching job', async () => {
			const dto: CreateLostItemDto = {
				type: 'lost',
				category: 'phone',
				title: 'iPhone 13 perdu',
				description:
					'Perdu près du marché de Cocody, coque noire avec autocollant',
				ville: 'Abidjan',
				eventDate: '2026-01-01',
				contactName: 'Jean Dupont',
				contactWhatsapp: '+2250700000000',
			}
			const created = buildLostItem()
			vi.mocked(useCases.create).mockResolvedValue(created)

			const result = await controller.create(session, dto)

			expect(useCases.create).toHaveBeenCalledWith({
				...dto,
				eventDate: new Date('2026-01-01'),
				userId: 'user-1',
			})
			expect(matchingQueue.add).toHaveBeenCalledWith(FIND_MATCHES_JOB, {
				lostItemId: created.id,
			})
			expect(result).toEqual(created)
		})
	})

	describe('list', () => {
		it('delegates to the use cases', async () => {
			const query: ListLostItemsQueryDto = { page: 1, pageSize: 20 }
			const response = {
				items: [buildLostItem()],
				total: 1,
				page: 1,
				pageSize: 20,
			}
			vi.mocked(useCases.list).mockResolvedValue(response)

			const result = await controller.list(query)

			expect(useCases.list).toHaveBeenCalledWith({
				...query,
				moderationStatus: 'published',
			})
			expect(result).toEqual(response)
		})
	})

	describe('listMine', () => {
		it('delegates to the use cases with the session user id', async () => {
			const query: ListLostItemsQueryDto = { page: 1, pageSize: 20 }
			const response = {
				items: [buildLostItem({ userId: 'user-1' })],
				total: 1,
				page: 1,
				pageSize: 20,
			}
			vi.mocked(useCases.listMine).mockResolvedValue(response)

			const result = await controller.listMine(session, query)

			expect(useCases.listMine).toHaveBeenCalledWith('user-1', query)
			expect(result).toEqual(response)
		})
	})

	describe('getOne', () => {
		it('delegates to the use cases', async () => {
			const lostItem = buildLostItem()
			vi.mocked(useCases.view).mockResolvedValue(lostItem)

			const result = await controller.getOne('lost-item-1')

			expect(useCases.view).toHaveBeenCalledWith('lost-item-1')
			expect(result).toEqual(lostItem)
		})
	})

	describe('recordContact', () => {
		it('delegates to the use cases', async () => {
			const lostItem = buildLostItem({ contactsCount: 1 })
			vi.mocked(useCases.recordContact).mockResolvedValue(lostItem)

			const result = await controller.recordContact('lost-item-1')

			expect(useCases.recordContact).toHaveBeenCalledWith('lost-item-1')
			expect(result).toEqual(lostItem)
		})
	})

	describe('update', () => {
		it('converts the eventDate string when present', async () => {
			const dto: UpdateLostItemDto = {
				title: 'Nouveau titre',
				eventDate: '2026-02-01',
			}
			const updated = buildLostItem({ title: 'Nouveau titre' })
			vi.mocked(useCases.update).mockResolvedValue(updated)

			const result = await controller.update(session, 'lost-item-1', dto)

			expect(useCases.update).toHaveBeenCalledWith('lost-item-1', 'user-1', {
				title: 'Nouveau titre',
				eventDate: new Date('2026-02-01'),
			})

			expect(result).toEqual(updated)
		})

		it('omits eventDate when not provided', async () => {
			const dto: UpdateLostItemDto = { title: 'Nouveau titre' }
			const updated = buildLostItem({ title: 'Nouveau titre' })
			vi.mocked(useCases.update).mockResolvedValue(updated)

			await controller.update(session, 'lost-item-1', dto)

			expect(useCases.update).toHaveBeenCalledWith('lost-item-1', 'user-1', {
				title: 'Nouveau titre',
			})
		})
	})

	describe('listForAdmin', () => {
		it('delegates to the use cases without forcing a moderation status', async () => {
			const query = { page: 1, pageSize: 20, moderationStatus: 'pending' as const }
			const response = {
				items: [buildLostItem({ moderationStatus: 'pending' })],
				total: 1,
				page: 1,
				pageSize: 20,
			}
			vi.mocked(useCases.list).mockResolvedValue(response)

			const result = await controller.listForAdmin(query)

			expect(useCases.list).toHaveBeenCalledWith(query)
			expect(result).toEqual(response)
		})
	})

	describe('updateModerationStatus', () => {
		it('delegates to the use cases', async () => {
			const moderated = buildLostItem({ moderationStatus: 'published' })
			vi.mocked(useCases.moderate).mockResolvedValue(moderated)

			const result = await controller.updateModerationStatus('lost-item-1', {
				moderationStatus: 'published',
			})

			expect(useCases.moderate).toHaveBeenCalledWith(
				'lost-item-1',
				'published',
			)
			expect(result).toEqual(moderated)
		})
	})

	describe('delete', () => {
		it('delegates to the use cases with the session user id', async () => {
			vi.mocked(useCases.delete).mockResolvedValue(undefined)

			await controller.delete(session, 'lost-item-1')

			expect(useCases.delete).toHaveBeenCalledWith('lost-item-1', 'user-1')
		})
	})
})
