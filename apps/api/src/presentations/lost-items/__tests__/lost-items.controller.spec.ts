import type { UserSession } from '@thallesp/nestjs-better-auth'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type {
	CreateLostItemData,
	ListLostItemsFilterData,
	MyLostItemsFilterData,
	UpdateLostItemData,
} from '@app/contracts/lost-items'
import {
	buildLostItem,
	buildPublicLostItem,
} from '@/domains/lost-items/__tests__/lost-item.fixture'
import type { CreateLostItemUseCase } from '@/domains/lost-items/use-cases/create-lost-item.use-case'
import type { CreateOfficialLostItemUseCase } from '@/domains/lost-items/use-cases/create-official-lost-item.use-case'
import type { DeleteLostItemUseCase } from '@/domains/lost-items/use-cases/delete-lost-item.use-case'
import type { GetMyLostItemsSummaryUseCase } from '@/domains/lost-items/use-cases/get-my-lost-items-summary.use-case'
import type { GetLostItemForDeskUseCase } from '@/domains/lost-items/use-cases/get-lost-item-for-desk.use-case'
import type { GetMyLostItemsUseCase } from '@/domains/lost-items/use-cases/get-my-lost-items.use-case'
import type { GetPaginatedLostItemsUseCase } from '@/domains/lost-items/use-cases/get-paginated-lost-items.use-case'
import type { GetPublicLostItemsUseCase } from '@/domains/lost-items/use-cases/get-public-lost-items.use-case'
import type { ModerateLostItemUseCase } from '@/domains/lost-items/use-cases/moderate-lost-item.use-case'
import type { ContactLostItemPosterUseCase } from '@/domains/lost-items/use-cases/contact-lost-item-poster.use-case'
import type { UpdateLostItemUseCase } from '@/domains/lost-items/use-cases/update-lost-item.use-case'
import type { ViewLostItemUseCase } from '@/domains/lost-items/use-cases/view-lost-item.use-case'
import type { Auth } from '@/infrastructures/auth/auth.config'
import { AccountBudget } from '@/shared/rate-limit/account-budget.service'
import { LOST_ITEM_PER_USER } from '@/shared/rate-limit/rate-limit.policy'
import { AccountBudgetExceededError } from '@/shared/rate-limit/account-budget.error'
import { LostItemsController } from '../lost-items.controller'

const session = {
	user: { id: 'user-1' },
} as UserSession<Auth>

function buildUseCase<TUseCase>(): TUseCase {
	return { execute: vi.fn() } as unknown as TUseCase
}

function buildMatchingDispatcher() {
	return { dispatch: vi.fn() }
}

describe('LostItemsController', () => {
	let createLostItem: CreateLostItemUseCase
	let createOfficialLostItem: CreateOfficialLostItemUseCase
	let viewLostItem: ViewLostItemUseCase
	let getLostItemForDesk: GetLostItemForDeskUseCase
	let contactLostItemPoster: ContactLostItemPosterUseCase
	let getPaginatedLostItems: GetPaginatedLostItemsUseCase
	let getPublicLostItems: GetPublicLostItemsUseCase
	let getMyLostItems: GetMyLostItemsUseCase
	let getMyLostItemsSummary: GetMyLostItemsSummaryUseCase
	let updateLostItem: UpdateLostItemUseCase
	let moderateLostItem: ModerateLostItemUseCase
	let deleteLostItem: DeleteLostItemUseCase
	let matchingDispatcher: ReturnType<typeof buildMatchingDispatcher>
	let accountBudget: AccountBudget
	let controller: LostItemsController

	beforeEach(() => {
		createLostItem = buildUseCase<CreateLostItemUseCase>()
		viewLostItem = buildUseCase<ViewLostItemUseCase>()
		getLostItemForDesk = buildUseCase<GetLostItemForDeskUseCase>()
		contactLostItemPoster = buildUseCase<ContactLostItemPosterUseCase>()
		getPaginatedLostItems = buildUseCase<GetPaginatedLostItemsUseCase>()
		getPublicLostItems = buildUseCase<GetPublicLostItemsUseCase>()
		getMyLostItems = buildUseCase<GetMyLostItemsUseCase>()
		getMyLostItemsSummary = buildUseCase<GetMyLostItemsSummaryUseCase>()
		updateLostItem = buildUseCase<UpdateLostItemUseCase>()
		moderateLostItem = buildUseCase<ModerateLostItemUseCase>()
		deleteLostItem = buildUseCase<DeleteLostItemUseCase>()
		createOfficialLostItem = buildUseCase<CreateOfficialLostItemUseCase>()
		matchingDispatcher = buildMatchingDispatcher()
		accountBudget = { require: vi.fn() } as unknown as AccountBudget
		controller = new LostItemsController(
			createLostItem,
			createOfficialLostItem,
			viewLostItem,
			getLostItemForDesk,
			contactLostItemPoster,
			getPaginatedLostItems,
			getPublicLostItems,
			getMyLostItems,
			getMyLostItemsSummary,
			updateLostItem,
			moderateLostItem,
			deleteLostItem,
			matchingDispatcher as never,
			accountBudget,
		)
	})

	describe('create', () => {
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

		it('converts the eventDate string and forwards the session user id', async () => {
			const created = buildLostItem()
			vi.mocked(createLostItem.execute).mockResolvedValue(created)

			const result = await controller.create(session, dto)

			expect(createLostItem.execute).toHaveBeenCalledWith({
				...dto,
				eventDate: new Date('2026-01-01'),
				userId: 'user-1',
			})
			expect(result).toEqual(created)
		})

		// What a flood of listings spends is the moderation queue, so the ceiling
		// is asked before the row is written.
		it('asks the account ceiling for the poster', async () => {
			vi.mocked(createLostItem.execute).mockResolvedValue(buildLostItem())

			await controller.create(session, dto)

			expect(accountBudget.require).toHaveBeenCalledWith(
				LOST_ITEM_PER_USER,
				'user-1',
			)
		})

		it('writes nothing when the ceiling refuses', async () => {
			vi.mocked(accountBudget.require).mockRejectedValue(
				new AccountBudgetExceededError(LOST_ITEM_PER_USER.message, 900),
			)

			await expect(controller.create(session, dto)).rejects.toBeInstanceOf(
				AccountBudgetExceededError,
			)
			expect(createLostItem.execute).not.toHaveBeenCalled()
		})
	})

	describe('createOfficial', () => {
		const dto = {
			type: 'found',
			category: 'documents',
			title: "Carte nationale d'identité au nom de Konan Aya",
			description: 'Déposée au bureau par un chauffeur de taxi communal.',
			ville: 'Abidjan',
			eventDate: '2026-09-06',
			contactName: 'Équipe RetrouveCI',
			contactWhatsapp: '+2250758412209',
			documentType: 'national_id',
			documentHolderName: 'Konan Aya',
			postedFor: 'Koffi Yao',
		} as Parameters<typeof controller.createOfficial>[0]

		it('converts the eventDate and passes no session user id', async () => {
			vi.mocked(createOfficialLostItem.execute).mockResolvedValue(
				buildLostItem({ official: true }),
			)

			await controller.createOfficial(dto)

			expect(createOfficialLostItem.execute).toHaveBeenCalledWith({
				...dto,
				eventDate: new Date('2026-09-06'),
			})
		})

		// It is born published, and publication is the only moment matching runs.
		it('dispatches matching, since the listing is already public', async () => {
			vi.mocked(createOfficialLostItem.execute).mockResolvedValue(
				buildLostItem({ id: 'official-1', official: true }),
			)

			await controller.createOfficial(dto)

			expect(matchingDispatcher.dispatch).toHaveBeenCalledWith('official-1')
		})

		/**
		 * `LOST_ITEM_PER_USER` bounds a flood of visitor listings by what it
		 * spends — the moderation queue — which this route does not use. What
		 * bounds this one is `@Roles(['admin'])`.
		 */
		it('asks no account ceiling', async () => {
			vi.mocked(createOfficialLostItem.execute).mockResolvedValue(
				buildLostItem({ official: true }),
			)

			await controller.createOfficial(dto)

			expect(accountBudget.require).not.toHaveBeenCalled()
		})

		it('does not go through the visitor use-case', async () => {
			vi.mocked(createOfficialLostItem.execute).mockResolvedValue(
				buildLostItem({ official: true }),
			)

			await controller.createOfficial(dto)

			expect(createLostItem.execute).not.toHaveBeenCalled()
		})
	})

	describe('list', () => {
		/**
		 * Publication and the projection moved into `GetPublicLostItemsUseCase`:
		 * a controller that carries them is one a new route can forget to copy.
		 */
		it('delegates the public listing to its own use-case', async () => {
			const query: ListLostItemsFilterData = { page: 1, pageSize: 20 }
			const response = {
				items: [buildPublicLostItem()],
				total: 1,
				page: 1,
				pageSize: 20,
			}
			vi.mocked(getPublicLostItems.execute).mockResolvedValue(response)

			const result = await controller.list(query)

			expect(getPublicLostItems.execute).toHaveBeenCalledWith(query)
			expect(getPaginatedLostItems.execute).not.toHaveBeenCalled()
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
			vi.mocked(getPublicLostItems.execute).mockResolvedValue({
				items: [],
				total: 0,
				page: 1,
				pageSize: 20,
			})

			await controller.list(query)

			expect(getPublicLostItems.execute).toHaveBeenCalledWith({
				page: 1,
				pageSize: 20,
				commune: 'Cocody',
				dateFrom: new Date('2026-01-01T00:00:00.000Z'),
				dateTo: new Date('2026-01-31T23:59:59.999Z'),
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

		/**
		 * The lifecycle filter is what « Mes annonces » puts in the URL, and the
		 * repository has always honoured it — until R11 no schema let it through,
		 * so the front had to fetch everything and filter in the browser.
		 */
		it('forwards the lifecycle status the owner filtered on', async () => {
			const query: MyLostItemsFilterData = {
				page: 2,
				pageSize: 12,
				resolutionStatus: 'resolved',
				search: 'sac',
			}
			vi.mocked(getMyLostItems.execute).mockResolvedValue({
				items: [],
				total: 0,
				page: 2,
				pageSize: 12,
			})

			await controller.listMine(session, query)

			expect(getMyLostItems.execute).toHaveBeenCalledWith({
				userId: 'user-1',
				filter: query,
			})
		})
	})

	describe('listMineSummary', () => {
		it('scopes the counts to the session user and nothing else', async () => {
			const summary = {
				total: 6,
				lifecycle: { active: 3, resolved: 2, expired: 1 },
				moderation: { pending: 1, published: 4, hidden: 1 },
			}
			vi.mocked(getMyLostItemsSummary.execute).mockResolvedValue(summary)

			const result = await controller.listMineSummary(session)

			expect(getMyLostItemsSummary.execute).toHaveBeenCalledExactlyOnceWith(
				'user-1',
			)
			expect(result).toEqual(summary)
		})
	})

	// The desk's own read, which is what the backoffice's detail page opens.
	describe('getOneForDesk', () => {
		it('reads the listing through the desk use-case, with no viewer', async () => {
			const lostItem = buildLostItem({ moderationStatus: 'pending' })
			vi.mocked(getLostItemForDesk.execute).mockResolvedValue(lostItem)

			const result = await controller.getOneForDesk('lost-item-1')

			expect(getLostItemForDesk.execute).toHaveBeenCalledWith('lost-item-1')
			expect(viewLostItem.execute).not.toHaveBeenCalled()
			expect(result).toEqual(lostItem)
		})
	})

	describe('getOne', () => {
		it('passes the signed-in visitor id along', async () => {
			const lostItem = buildLostItem()
			vi.mocked(viewLostItem.execute).mockResolvedValue(lostItem)

			const result = await controller.getOne(session, 'lost-item-1')

			expect(viewLostItem.execute).toHaveBeenCalledWith({
				id: 'lost-item-1',
				viewerId: 'user-1',
			})
			expect(result).toEqual(lostItem)
		})

		/** `@OptionalAuth()`: no session, so no viewer to compare the owner to. */
		it('passes no viewer id when nobody is signed in', async () => {
			vi.mocked(viewLostItem.execute).mockResolvedValue(buildLostItem())

			await controller.getOne(null, 'lost-item-1')

			expect(viewLostItem.execute).toHaveBeenCalledWith({
				id: 'lost-item-1',
				viewerId: undefined,
			})
		})
	})

	describe('contactPoster', () => {
		it('is open to an anonymous finder and answers only the target', async () => {
			const target = { url: 'https://wa.me/2250700000000?text=Bonjour' }
			vi.mocked(contactLostItemPoster.execute).mockResolvedValue(target)

			expect(await controller.contactPoster('lost-item-1')).toEqual(target)
			expect(contactLostItemPoster.execute).toHaveBeenCalledWith('lost-item-1')
			expect(Reflect.getMetadata('PUBLIC', controller.contactPoster)).toBe(true)
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

		it('delegates to the use-case and enqueues a matching job on publication', async () => {
			const lostItem = buildLostItem({ moderationStatus: 'published' })
			vi.mocked(moderateLostItem.execute).mockResolvedValue({
				lostItem,
				becamePublished: true,
			})

			const result = await controller.updateModerationStatus('lost-item-1', {
				moderationStatus: 'published',
			})

			expect(moderateLostItem.execute).toHaveBeenCalledWith({
				id: 'lost-item-1',
				moderationStatus: 'published',
			})
			expect(matchingDispatcher.dispatch).toHaveBeenCalledWith('lost-item-1')
			// The outcome is the use-case's shape; the route still answers the row.
			expect(result).toEqual(lostItem)
		})

		/** Publication is the only transition that makes a listing matchable. */
		it.each(['pending', 'hidden'] as const)(
			'enqueues nothing when moderating to %s',
			async moderationStatus => {
				vi.mocked(moderateLostItem.execute).mockResolvedValue({
					lostItem: buildLostItem({ moderationStatus }),
					becamePublished: false,
				})

				await controller.updateModerationStatus('lost-item-1', {
					moderationStatus,
				})

				expect(matchingDispatcher.dispatch).not.toHaveBeenCalled()
			},
		)

		// ⚠️ The route reads the transition, not the state: a second publish of an
		// already-published listing used to search for matches — and notify —
		// again, since the row it answers says `published` either way.
		it('enqueues nothing when publication changed nothing', async () => {
			vi.mocked(moderateLostItem.execute).mockResolvedValue({
				lostItem: buildLostItem({ moderationStatus: 'published' }),
				becamePublished: false,
			})

			await controller.updateModerationStatus('lost-item-1', {
				moderationStatus: 'published',
			})

			expect(matchingDispatcher.dispatch).not.toHaveBeenCalled()
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
