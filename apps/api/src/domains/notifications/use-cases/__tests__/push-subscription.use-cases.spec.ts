import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	PUSH_AUTH_LENGTH,
	PUSH_P256DH_LENGTH,
} from '@app/contracts/notifications'
import type { PushSubscriptionRepository } from '../../repository/push-subscription.repository'
import { CountPushSubscriptionsUseCase } from '../count-push-subscriptions.use-case'
import { SubscribeToPushUseCase } from '../subscribe-to-push.use-case'
import { UnsubscribeFromPushUseCase } from '../unsubscribe-from-push.use-case'

const ENDPOINT = 'https://fcm.googleapis.com/fcm/send/abc'

const RECORD = {
	endpoint: ENDPOINT,
	p256dh: 'a'.repeat(PUSH_P256DH_LENGTH),
	auth: 'b'.repeat(PUSH_AUTH_LENGTH),
}

function buildRepository(): PushSubscriptionRepository {
	return {
		upsert: vi.fn().mockResolvedValue({ id: 'sub-1' }),
		deleteOwn: vi.fn().mockResolvedValue(1),
		countAll: vi.fn().mockResolvedValue(0),
	} as unknown as PushSubscriptionRepository
}

describe('the push subscription use-cases', () => {
	let repository: PushSubscriptionRepository

	beforeEach(() => {
		repository = buildRepository()
	})

	describe('SubscribeToPushUseCase', () => {
		// The owner travels apart from the record, so the row cannot be stored
		// under an id the body carried.
		it('hands the owner and the record over separately', async () => {
			await new SubscribeToPushUseCase(repository).execute({
				userId: 'user-1',
				...RECORD,
			})

			expect(repository.upsert).toHaveBeenCalledWith('user-1', RECORD)
		})
	})

	describe('UnsubscribeFromPushUseCase', () => {
		it('scopes the delete to the caller', async () => {
			await new UnsubscribeFromPushUseCase(repository).execute({
				userId: 'user-1',
				endpoint: ENDPOINT,
			})

			expect(repository.deleteOwn).toHaveBeenCalledWith('user-1', ENDPOINT)
		})

		// A browser whose permission was revoked elsewhere still calls this, and
		// it has nothing to be told.
		it('says nothing when the row is already gone', async () => {
			vi.mocked(repository.deleteOwn).mockResolvedValue(0)

			await expect(
				new UnsubscribeFromPushUseCase(repository).execute({
					userId: 'user-1',
					endpoint: ENDPOINT,
				}),
			).resolves.toBeUndefined()
		})
	})

	describe('CountPushSubscriptionsUseCase', () => {
		it.each([0, 4])('answers the bare count %i', async count => {
			vi.mocked(repository.countAll).mockResolvedValue(count)

			expect(
				await new CountPushSubscriptionsUseCase(repository).execute(),
			).toBe(count)
		})
	})
})
