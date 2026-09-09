import { Injectable } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { PushSubscriptionRepository } from '../repository/push-subscription.repository'
import type { SubscribeToPushInput } from '../types/push-subscription.types'

@Injectable()
export class SubscribeToPushUseCase implements IDomainUseCase<
	SubscribeToPushInput,
	void
> {
	constructor(private readonly repository: PushSubscriptionRepository) {}

	async execute({ userId, ...record }: SubscribeToPushInput): Promise<void> {
		await this.repository.upsert(userId, record)
	}
}
