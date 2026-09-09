import { Injectable } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { PushSubscriptionRepository } from '../repository/push-subscription.repository'
import type { UnsubscribeFromPushInput } from '../types/push-subscription.types'

@Injectable()
export class UnsubscribeFromPushUseCase implements IDomainUseCase<
	UnsubscribeFromPushInput,
	void
> {
	constructor(private readonly repository: PushSubscriptionRepository) {}

	// Silent on a row that is not there: a browser whose permission was revoked
	// elsewhere still calls this, and it has nothing to be told.
	async execute({ userId, endpoint }: UnsubscribeFromPushInput): Promise<void> {
		await this.repository.deleteOwn(userId, endpoint)
	}
}
