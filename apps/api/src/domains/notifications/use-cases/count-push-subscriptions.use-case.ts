import { Injectable } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { PushSubscriptionRepository } from '../repository/push-subscription.repository'

// The figure A3 was waiting on. A subscription needs both an install and a
// granted permission, so counting them answers « would a push reach anyone »
// without any audience measurement.
@Injectable()
export class CountPushSubscriptionsUseCase implements IDomainUseCase<
	void,
	number
> {
	constructor(private readonly repository: PushSubscriptionRepository) {}

	execute(): Promise<number> {
		return this.repository.countAll()
	}
}
