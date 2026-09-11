import { describe, expect, it } from 'vitest'
import { batchIdsSchema, MAX_BATCH_SIZE } from '../batch'
import { batchModerateLostItemsSchema } from '../../lost-items/batch-moderation.schema'
import { batchUpdateContactMessageStatusSchema } from '../../contact-messages/batch-status.schema'
import { batchUpdateStickerOrderStatusSchema } from '../../sticker-orders/batch-status.schema'

const ids = (count: number) =>
	Array.from({ length: count }, (_, index) => `id-${index}`)

describe('batchIdsSchema', () => {
	it('accepts a selection', () => {
		expect(batchIdsSchema.parse(['a', 'b'])).toEqual(['a', 'b'])
	})

	it.each([[[]], [undefined], ['a']])('refuses %j', value => {
		expect(batchIdsSchema.safeParse(value).success).toBe(false)
	})

	it('refuses an empty id in an otherwise valid selection', () => {
		expect(batchIdsSchema.safeParse(['a', '']).success).toBe(false)
	})

	it('accepts the ceiling and refuses one past it', () => {
		expect(batchIdsSchema.safeParse(ids(MAX_BATCH_SIZE)).success).toBe(true)
		expect(batchIdsSchema.safeParse(ids(MAX_BATCH_SIZE + 1)).success).toBe(
			false,
		)
	})

	// Every message a form can show must be French, as the pipe demands.
	it.each([[[]], [undefined], [ids(MAX_BATCH_SIZE + 1)]])(
		'answers %#  in French',
		value => {
			const result = batchIdsSchema.safeParse(value)

			expect(result.success).toBe(false)
			for (const issue of result.error?.issues ?? [])
				expect(issue.message).not.toMatch(/[a-z] (of|at least|most|array)/i)
		},
	)
})

/**
 * ⚠️ Each of the three names the one decision a batch may take, and refuses
 * every other. Hiding is a judgement on one listing, and a cancellation is one
 * order's: what keeps them out of a batch is the schema, not the interface.
 */
describe('what a batch may decide', () => {
	it('publishes listings, and moderates them no other way', () => {
		expect(
			batchModerateLostItemsSchema.safeParse({
				ids: ['a'],
				moderationStatus: 'published',
			}).success,
		).toBe(true)

		for (const moderationStatus of ['hidden', 'pending']) {
			expect(
				batchModerateLostItemsSchema.safeParse({
					ids: ['a'],
					moderationStatus,
				}).success,
			).toBe(false)
		}
	})

	it('archives messages, and marks none read', () => {
		expect(
			batchUpdateContactMessageStatusSchema.safeParse({
				ids: ['a'],
				status: 'archived',
			}).success,
		).toBe(true)

		for (const status of ['new', 'read']) {
			expect(
				batchUpdateContactMessageStatusSchema.safeParse({ ids: ['a'], status })
					.success,
			).toBe(false)
		}
	})

	it.each(['processing', 'shipped', 'delivered'])(
		'moves an order to %s',
		status => {
			expect(
				batchUpdateStickerOrderStatusSchema.safeParse({ ids: ['a'], status })
					.success,
			).toBe(true)
		},
	)

	// The one that would cost money: a cancellation unpromises a delivery.
	it.each(['cancelled', 'pending'])('refuses %s in a batch', status => {
		expect(
			batchUpdateStickerOrderStatusSchema.safeParse({ ids: ['a'], status })
				.success,
		).toBe(false)
	})
})
