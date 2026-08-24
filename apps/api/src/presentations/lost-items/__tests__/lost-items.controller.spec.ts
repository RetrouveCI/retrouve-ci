import type { UserSession } from '@thallesp/nestjs-better-auth'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type {
	CreateLostItemData,
	ListLostItemsFilterData,
	UpdateLostItemData,
} from '@app/contracts/lost-items'
import { buildLostItem } from '@/domains/lost-items/__tests__/lost-item.fixture'
import type { CreateLostItemUseCase } from '@/domains/lost-items/use-cases/create-lost-item.use-case'
import type { DeleteLostItemUseCase } from '@/domains/lost-items/use-cases/delete-lost-item.use-case'
import type { GetLostItemByIdUseCase } from '@/domains/lost-items/use-cases/get-lost-item-by-id.use-case'
import type { GetMyLostItemsUseCase } from '@/domains/lost-items/use-cases/get-my-lost-items.use-case'
import type { GetPaginatedLostItemsUseCase } from '@/domains/lost-items/use-cases/get-paginated-lost-items.use-case'
import type { ModerateLostItemUseCase } from '@/domains/lost-items/use-cases/moderate-lost-item.use-case'
import type { RecordLostItemContactUseCase } from '@/domains/lost-items/use-cases/record-lost-item-contact.use-case'
import type { UpdateLostItemUseCase } from '@/domains/lost-items/use-cases/update-lost-item.use-case'
import type { Auth } from '@/infrastructures/auth/auth.config'
import { FIND_MATCHES_JOB } from '@/infrastructures/queue/queue.constants'
import { LostItemsController } from '../lost-items.controller'

const session = {
	user: { id: 'user-1' },
} as UserSession<Auth>

function buildUseCase<TUseCase>(): TUseCase {
	return { execute: vi.fn() } as unknown as TUseCase
}

function buildMatchingQueue() {
	return { add: vi.fn() }
}

describe('LostItemsController', () => {
	let createLostItem: CreateLostItemUseCase
	let getLostItemById: GetLostItemByIdUseCase
	let recordLostItemContact: RecordLostItemContactUseCase
	let getPaginatedLostItems: GetPaginatedLostItemsUseCase
	let getMyLostItems: GetMyLostItemsUseCase
	let updateLostItem: UpdateLostItemUseCase
	let moderateLostItem: ModerateLostItemUseCase
	let deleteLostItem: DeleteLostItemUseCase
	let matchingQueue: ReturnType<typeof buildMatchingQueue>
	let controller: LostItemsController

	beforeEach(() => {
		createLostItem = buildUseCase<CreateLostItemUseCase>()
		getLostItemById = buildUseCase<GetLostItemByIdUseCase>()
		recordLostItemContact = buildUseCase<RecordLostItemContactUseCase>()
		getPaginatedLostItems = buildUseCase<GetPaginatedLostItemsUseCase>()
		getMyLostItems = buildUseCase<GetMyLostItemsUseCase>()
		updateLostItem = buildUseCase<UpdateLostItemUseCase>()
		moderateLostItem = buildUseCase<ModerateLostItemUseCase>()
		deleteLostItem = buildUseCase<DeleteLostItemUseCase>()
		matchingQueue = buildMatchingQueue()
		controller = new LostItemsController(
			createLostItem,
			getLostItemById,
			recordLostItemContact,
			getPaginatedLostItems,
			getMyLostItems,
			updateLostItem,
			moderateLostItem,
			deleteLostItem,
			matchingQueue as never,
		)
	})

	describe('create', () => {
		it('converts the eventDate string, forwards the session user id and enqueues a matching job', async () => {
			const dto: CreateLostItemData = {
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
			vi.mocked(createLostItem.execute).mockResolvedValue(created)

			const result = await controller.create(session, dto)

			expect(createLostItem.execute).toHaveBeenCalledWith({
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
		it('forces the moderation status to published', async () => {
			const query: ListLostItemsFilterData = { page: 1, pageSize: 20 }
			const response = {
				items: [buildLostItem()],
				total: 1,
				page: 1,
				pageSize: 20,
			}
			vi.mocked(getPaginatedLostItems.execute).mockResolvedValue(response)

			const result = await controller.list(query)

			expect(getPaginatedLostItems.execute).toHaveBeenCalledWith({
				...query,
				moderationStatus: 'published',
			})
			expect(result).toEqual(response)
		})

		it('forwards commune and converts the date range to inclusive day bounds', async () => {
			const query: ListLostItemsFilterData = {
				page: 1,
				pageSize: 20,
				commune: 'Cocody',
				dateFrom: '2026-01-01',
				dateTo: '2026-01-31',
			}
			vi.mocked(getPaginatedLostItems.execute).mockResolvedValue({
				items: [],
				total: 0,
				page: 1,
				pageSize: 20,
			})

			await controller.list(query)

			expect(getPaginatedLostItems.execute).toHaveBeenCalledWith({
				page: 1,
				pageSize: 20,
				commune: 'Cocody',
				dateFrom: new Date('2026-01-01T00:00:00.000Z'),
				dateTo: new Date('2026-01-31T23:59:59.999Z'),
				moderationStatus: 'published',
			})
		})
	})

	describe('listMine', () => {
		it('passes the session user id alongside the filter', async () => {
			const query: ListLostItemsFilterData = { page: 1, pageSize: 20 }
			const response = {
				items: [buildLostItem({ userId: 'user-1' })],
				total: 1,
				page: 1,
				pageSize: 20,
			}
			vi.mocked(getMyLostItems.execute).mockResolvedValue(response)

			const result = await controller.listMine(session, query)

			expect(getMyLostItems.execute).toHaveBeenCalledWith({
				userId: 'user-1',
				filter: query,
			})
			expect(result).toEqual(response)
		})
	})

	describe('getOne', () => {
		it('delegates to the use-case', async () => {
			const lostItem = buildLostItem()
			vi.mocked(getLostItemById.execute).mockResolvedValue(lostItem)

			const result = await controller.getOne('lost-item-1')

			expect(getLostItemById.execute).toHaveBeenCalledWith('lost-item-1')
			expect(result).toEqual(lostItem)
		})
	})

	describe('recordContact', () => {
		it('delegates to the use-case', async () => {
			const lostItem = buildLostItem({ contactsCount: 1 })
			vi.mocked(recordLostItemContact.execute).mockResolvedValue(lostItem)

			const result = await controller.recordContact('lost-item-1')

			expect(recordLostItemContact.execute).toHaveBeenCalledWith('lost-item-1')
			expect(result).toEqual(lostItem)
		})
	})

	describe('update', () => {
		it('converts the eventDate string when present', async () => {
			const dto: UpdateLostItemData = {
				title: 'Nouveau titre',
				eventDate: '2026-02-01',
			}
			const updated = buildLostItem({ title: 'Nouveau titre' })
			vi.mocked(updateLostItem.execute).mockResolvedValue(updated)

			const result = await controller.update(session, 'lost-item-1', dto)

			expect(updateLostItem.execute).toHaveBeenCalledWith({
				id: 'lost-item-1',
				userId: 'user-1',
				data: {
					title: 'Nouveau titre',
					eventDate: new Date('2026-02-01'),
				},
			})
			expect(result).toEqual(updated)
		})

		it('omits eventDate when not provided', async () => {
			const dto: UpdateLostItemData = { title: 'Nouveau titre' }
			const updated = buildLostItem({ title: 'Nouveau titre' })
			vi.mocked(updateLostItem.execute).mockResolvedValue(updated)

			await controller.update(session, 'lost-item-1', dto)

			expect(updateLostItem.execute).toHaveBeenCalledWith({
				id: 'lost-item-1',
				userId: 'user-1',
				data: { title: 'Nouveau titre' },
			})
		})
	})

	describe('listForAdmin', () => {
		it('is restricted to admins', () => {
			expect(Reflect.getMetadata('ROLES', controller.listForAdmin)).toEqual([
				'admin',
			])
		})

		it('does not force a moderation status', async () => {
			const query = {
				page: 1,
				pageSize: 20,
				moderationStatus: 'pending' as const,
			}
			const response = {
				items: [buildLostItem({ moderationStatus: 'pending' })],
				total: 1,
				page: 1,
				pageSize: 20,
			}
			vi.mocked(getPaginatedLostItems.execute).mockResolvedValue(response)

			const result = await controller.listForAdmin(query)

			expect(getPaginatedLostItems.execute).toHaveBeenCalledWith(query)
			expect(result).toEqual(response)
		})
	})

	describe('updateModerationStatus', () => {
		it('is restricted to admins', () => {
			expect(
				Reflect.getMetadata('ROLES', controller.updateModerationStatus),
			).toEqual(['admin'])
		})

		it('delegates to the use-case', async () => {
			const moderated = buildLostItem({ moderationStatus: 'published' })
			vi.mocked(moderateLostItem.execute).mockResolvedValue(moderated)

			const result = await controller.updateModerationStatus('lost-item-1', {
				moderationStatus: 'published',
			})

			expect(moderateLostItem.execute).toHaveBeenCalledWith({
				id: 'lost-item-1',
				moderationStatus: 'published',
			})
			expect(result).toEqual(moderated)
		})
	})

	describe('delete', () => {
		it('passes the session user id alongside the id', async () => {
			vi.mocked(deleteLostItem.execute).mockResolvedValue(undefined)

			await controller.delete(session, 'lost-item-1')

			expect(deleteLostItem.execute).toHaveBeenCalledWith({
				id: 'lost-item-1',
				userId: 'user-1',
			})
		})
	})
})
