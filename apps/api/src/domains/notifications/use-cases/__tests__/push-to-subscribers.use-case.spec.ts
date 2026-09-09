import { beforeEach, describe, expect, it, vi } from 'vitest'
import type {
	PushOutcome,
	WebPushClient,
} from '@/infrastructures/push/web-push.client'
import type { PushSubscriptionRepository } from '../../repository/push-subscription.repository'
import { PushToSubscribersUseCase } from '../push-to-subscribers.use-case'

const target = (endpoint: string) => ({
	endpoint,
	p256dh: 'a'.repeat(87),
	auth: 'b'.repeat(22),
})

const PAYLOAD = {
	title: 'Correspondance trouvée',
	message: 'Une annonce correspond.',
	link: '/posts/abc',
}

describe('PushToSubscribersUseCase', () => {
	let repository: PushSubscriptionRepository
	let client: WebPushClient
	let useCase: PushToSubscribersUseCase

	function answers(...outcomes: PushOutcome[]) {
		let call = 0
		vi.mocked(client.send).mockImplementation(() =>
			Promise.resolve(outcomes[call++] ?? 'sent'),
		)
	}

	beforeEach(() => {
		repository = {
			findForUser: vi.fn().mockResolvedValue([]),
			deleteByEndpoint: vi.fn().mockResolvedValue(undefined),
		} as unknown as PushSubscriptionRepository
		client = {
			send: vi.fn().mockResolvedValue('sent'),
		} as unknown as WebPushClient
		useCase = new PushToSubscribersUseCase(repository, client)
	})

	it('sends to every device the account holds', async () => {
		vi.mocked(repository.findForUser).mockResolvedValue([
			target('https://a.example/1'),
			target('https://b.example/2'),
		])

		await useCase.execute({ userId: 'user-1', ...PAYLOAD })

		expect(client.send).toHaveBeenCalledTimes(2)
		expect(client.send).toHaveBeenCalledWith(
			target('https://a.example/1'),
			PAYLOAD,
		)
	})

	it('reaches the transport not at all when there is no device', async () => {
		await useCase.execute({ userId: 'user-1', ...PAYLOAD })

		expect(client.send).not.toHaveBeenCalled()
	})

	// ⚠️ A row kept for a dropped browser would pad the count A3 is decided on.
	it('forgets a subscription the push service says is gone', async () => {
		vi.mocked(repository.findForUser).mockResolvedValue([
			target('https://a.example/1'),
			target('https://b.example/2'),
		])
		answers('gone', 'sent')

		await useCase.execute({ userId: 'user-1', ...PAYLOAD })

		expect(repository.deleteByEndpoint).toHaveBeenCalledTimes(1)
		expect(repository.deleteByEndpoint).toHaveBeenCalledWith(
			'https://a.example/1',
		)
	})

	it.each<PushOutcome>(['sent', 'failed', 'unconfigured'])(
		'keeps the row on a %s answer',
		async outcome => {
			vi.mocked(repository.findForUser).mockResolvedValue([
				target('https://a.example/1'),
			])
			answers(outcome)

			await useCase.execute({ userId: 'user-1', ...PAYLOAD })

			expect(repository.deleteByEndpoint).not.toHaveBeenCalled()
		},
	)

	// One dead device must not cost the others their notification.
	it('sends to the live devices even when one is gone', async () => {
		vi.mocked(repository.findForUser).mockResolvedValue([
			target('https://a.example/1'),
			target('https://b.example/2'),
			target('https://c.example/3'),
		])
		answers('gone', 'sent', 'sent')

		await useCase.execute({ userId: 'user-1', ...PAYLOAD })

		expect(client.send).toHaveBeenCalledTimes(3)
		expect(repository.deleteByEndpoint).toHaveBeenCalledTimes(1)
	})
})
