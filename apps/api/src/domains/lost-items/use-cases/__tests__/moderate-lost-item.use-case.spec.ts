import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MODERATION_REASONS } from '@app/contracts/lost-items'
import { CreateNotificationUseCase } from '@/domains/notifications/use-cases/create-notification.use-case'
import {
	buildLostItem,
	buildRepository,
} from '../../__tests__/lost-item.fixture'
import { LostItemNotFoundError } from '../../errors/lost-item.errors'
import type { LostItemRepository } from '../../repository/lost-item.repository'
import type { LostItem } from '../../types/lost-item.types'
import { ModerateLostItemUseCase } from '../moderate-lost-item.use-case'

describe('ModerateLostItemUseCase', () => {
	let repository: LostItemRepository
	let notifier: CreateNotificationUseCase
	let useCase: ModerateLostItemUseCase

	beforeEach(() => {
		repository = buildRepository()
		notifier = {
			execute: vi.fn().mockResolvedValue(undefined),
		} as unknown as CreateNotificationUseCase
		useCase = new ModerateLostItemUseCase(repository, notifier)
	})

	// `before` is what the row was, `after` what the write answered.
	const settle = (before: Partial<LostItem>, after: Partial<LostItem>) => {
		vi.mocked(repository.findById).mockResolvedValue(buildLostItem(before))
		vi.mocked(repository.updateModerationStatus).mockResolvedValue(
			buildLostItem(after),
		)
	}

	const notice = () => vi.mocked(notifier.execute).mock.calls[0]?.[0]

	it('updates the moderation status', async () => {
		settle({ moderationStatus: 'pending' }, { moderationStatus: 'published' })

		const { lostItem } = await useCase.execute({
			id: 'lost-item-1',
			moderationStatus: 'published',
		})

		expect(repository.updateModerationStatus).toHaveBeenCalledWith(
			'lost-item-1',
			{ moderationStatus: 'published' },
		)
		expect(lostItem.moderationStatus).toBe('published')
	})

	// The id is the route's, so it must not reach the write as a field.
	it('carries the reason and its note through to the write', async () => {
		settle({}, { moderationStatus: 'hidden' })

		await useCase.execute({
			id: 'lost-item-1',
			moderationStatus: 'hidden',
			moderationReason: 'other',
			moderationReasonNote: 'La 2e photo montre une carte bancaire.',
		})

		expect(repository.updateModerationStatus).toHaveBeenCalledWith(
			'lost-item-1',
			{
				moderationStatus: 'hidden',
				moderationReason: 'other',
				moderationReasonNote: 'La 2e photo montre une carte bancaire.',
			},
		)
	})

	it('throws when the item does not exist, without writing', async () => {
		vi.mocked(repository.findById).mockResolvedValue(null)

		await expect(
			useCase.execute({ id: 'missing', moderationStatus: 'published' }),
		).rejects.toThrow(LostItemNotFoundError)
		expect(repository.updateModerationStatus).not.toHaveBeenCalled()
		expect(notifier.execute).not.toHaveBeenCalled()
	})

	/** Moderation is an admin action: it deliberately checks no ownership. */
	it('moderates an item owned by somebody else', async () => {
		settle(
			{ userId: 'user-9' },
			{ userId: 'user-9', moderationStatus: 'hidden' },
		)

		const { lostItem } = await useCase.execute({
			id: 'lost-item-1',
			moderationStatus: 'hidden',
		})

		expect(lostItem.userId).toBe('user-9')
	})

	// Publication is the only moment matching runs, so the route needs the
	// transition and not the state the row ends in.
	describe('the transition it reports', () => {
		it.each(['pending', 'hidden'] as const)(
			'reports a publication coming from %s',
			async moderationStatus => {
				settle({ moderationStatus }, { moderationStatus: 'published' })

				const { becamePublished } = await useCase.execute({
					id: 'lost-item-1',
					moderationStatus: 'published',
				})

				expect(becamePublished).toBe(true)
			},
		)

		it('reports no publication when the listing was already published', async () => {
			settle(
				{ moderationStatus: 'published' },
				{ moderationStatus: 'published' },
			)

			const { becamePublished } = await useCase.execute({
				id: 'lost-item-1',
				moderationStatus: 'published',
			})

			expect(becamePublished).toBe(false)
		})

		it.each(['pending', 'hidden'] as const)(
			'reports no publication when moderating to %s',
			async moderationStatus => {
				settle({ moderationStatus: 'published' }, { moderationStatus })

				const { becamePublished } = await useCase.execute({
					id: 'lost-item-1',
					moderationStatus,
				})

				expect(becamePublished).toBe(false)
			},
		)
	})

	// What the step is for: the poster used to learn the verdict only by coming
	// back to the page.
	describe('telling the poster', () => {
		it('names the listing and addresses its owner', async () => {
			settle(
				{ moderationStatus: 'pending' },
				{
					moderationStatus: 'published',
					title: 'Sac à dos noir',
					userId: 'user-7',
				},
			)

			await useCase.execute({
				id: 'lost-item-1',
				moderationStatus: 'published',
			})

			expect(notice()).toEqual(
				expect.objectContaining({
					type: 'listing_moderated',
					userId: 'user-7',
					link: '/account/posts',
				}),
			)
			expect(notice()?.message).toContain('« Sac à dos noir »')
		})

		it.each([
			['published', 'en ligne', 'visible publiquement'],
			['hidden', 'masquée', "n'est plus visible"],
			['pending', 'en attente', 'attente de validation'],
		] as const)(
			'words a %s verdict',
			async (moderationStatus, inTitle, inMessage) => {
				settle(
					{
						moderationStatus:
							moderationStatus === 'pending' ? 'published' : 'pending',
					},
					{ moderationStatus },
				)

				await useCase.execute({ id: 'lost-item-1', moderationStatus })

				expect(notice()?.title).toContain(inTitle)
				expect(notice()?.message).toContain(inMessage)
			},
		)

		// The same code the card words, so a fault reads the same way on both.
		it.each(MODERATION_REASONS.filter(reason => reason !== 'other'))(
			'carries the %s reason A1 wrote',
			async moderationReason => {
				settle(
					{ moderationStatus: 'pending' },
					{ moderationStatus: 'hidden', moderationReason },
				)

				await useCase.execute({
					id: 'lost-item-1',
					moderationStatus: 'hidden',
					moderationReason,
				})

				expect(notice()?.message).toContain('Motif : ')
			},
		)

		it('carries the note behind « Autre »', async () => {
			settle(
				{ moderationStatus: 'pending' },
				{
					moderationStatus: 'hidden',
					moderationReason: 'other',
					moderationReasonNote: 'La 2e photo.',
				},
			)

			await useCase.execute({
				id: 'lost-item-1',
				moderationStatus: 'hidden',
				moderationReason: 'other',
				moderationReasonNote: 'La 2e photo.',
			})

			expect(notice()?.message).toContain('Motif : La 2e photo.')
		})

		// A hiding without a reason stays possible, and says only the fact.
		it('says only the fact when no reason was given', async () => {
			settle({ moderationStatus: 'pending' }, { moderationStatus: 'hidden' })

			await useCase.execute({ id: 'lost-item-1', moderationStatus: 'hidden' })

			expect(notice()?.message).not.toContain('Motif')
		})

		// ⚠️ A1's rule: say why, without promising a return. `repository.update()`
		// writes no moderation status, so an edit sends nothing back for review.
		it('promises no return online, whatever the verdict', async () => {
			for (const moderationStatus of [
				'published',
				'hidden',
				'pending',
			] as const) {
				for (const moderationReason of MODERATION_REASONS) {
					vi.mocked(notifier.execute).mockClear()
					settle(
						{ moderationStatus: 'pending', moderationReason: null },
						{
							moderationStatus,
							moderationReason,
							moderationReasonNote: 'x',
						},
					)

					await useCase.execute({ id: 'lost-item-1', moderationStatus })

					expect(notice()?.message).not.toMatch(
						/republi|remettre en ligne|reparaît/i,
					)
				}
			}
		})

		// A moderator who publishes twice must not notify twice — and the route
		// must not look for matches twice either.
		it('tells nobody when the decision changed nothing', async () => {
			settle(
				{ moderationStatus: 'hidden', moderationReason: 'duplicate' },
				{ moderationStatus: 'hidden', moderationReason: 'duplicate' },
			)

			await useCase.execute({
				id: 'lost-item-1',
				moderationStatus: 'hidden',
				moderationReason: 'duplicate',
			})

			expect(notifier.execute).not.toHaveBeenCalled()
		})

		// A re-hiding for another fault is a new verdict to read.
		it('tells the poster when only the reason changed', async () => {
			settle(
				{ moderationStatus: 'hidden', moderationReason: 'duplicate' },
				{ moderationStatus: 'hidden', moderationReason: 'off_topic' },
			)

			await useCase.execute({
				id: 'lost-item-1',
				moderationStatus: 'hidden',
				moderationReason: 'off_topic',
			})

			expect(notifier.execute).toHaveBeenCalledTimes(1)
		})

		// The row is already written by then: losing the notice must not answer
		// 500 to the moderator who just decided.
		it('still moderates when the notice fails', async () => {
			settle({ moderationStatus: 'pending' }, { moderationStatus: 'published' })
			vi.mocked(notifier.execute).mockRejectedValue(new Error('redis down'))

			await expect(
				useCase.execute({ id: 'lost-item-1', moderationStatus: 'published' }),
			).resolves.toMatchObject({ becamePublished: true })
		})
	})
})
