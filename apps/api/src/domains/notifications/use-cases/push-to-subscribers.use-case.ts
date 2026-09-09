import { Injectable, Logger } from '@nestjs/common'
import { WebPushClient } from '@/infrastructures/push/web-push.client'
import type { PushPayload } from '@/infrastructures/push/web-push.client'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { PushSubscriptionRepository } from '../repository/push-subscription.repository'

export interface PushToSubscribersInput extends PushPayload {
	userId: string
}

@Injectable()
export class PushToSubscribersUseCase implements IDomainUseCase<
	PushToSubscribersInput,
	void
> {
	private readonly logger = new Logger(PushToSubscribersUseCase.name)

	constructor(
		private readonly repository: PushSubscriptionRepository,
		private readonly client: WebPushClient,
	) {}

	// One device may hold a subscription the browser has since dropped, so a
	// `gone` answer deletes the row: a count padded with dead devices would lie
	// to the decision it exists to inform.
	async execute({ userId, ...payload }: PushToSubscribersInput): Promise<void> {
		const targets = await this.repository.findForUser(userId)

		if (targets.length === 0) return

		const outcomes = await Promise.all(
			targets.map(async target => ({
				endpoint: target.endpoint,
				outcome: await this.client.send(target, payload),
			})),
		)

		const gone = outcomes.filter(result => result.outcome === 'gone')

		await Promise.all(
			gone.map(result => this.repository.deleteByEndpoint(result.endpoint)),
		)

		const sent = outcomes.filter(result => result.outcome === 'sent').length

		this.logger.log(
			`Push for user ${userId}: ${sent} sent, ${gone.length} dropped`,
		)
	}
}
