import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import type { Queue } from 'bullmq'
import {
	FIND_MATCHES_JOB,
	MATCHING_ATTEMPTS,
	MATCHING_BACKOFF_DELAY_MS,
	MATCHING_KEEP_COMPLETED,
	MATCHING_KEEP_FAILED_SECONDS,
	MATCHING_QUEUE,
} from './queue.constants'

export interface FindMatchesJobData {
	lostItemId: string
}

@Injectable()
export class MatchingDispatcher {
	constructor(
		@InjectQueue(MATCHING_QUEUE)
		private readonly queue: Queue<FindMatchesJobData>,
	) {}

	/**
	 * The enqueue carried no options at all, so it inherited BullMQ's defaults:
	 * a single attempt, and no eviction. A transient database failure dropped
	 * the notification silently, and every completed job stayed in Redis for
	 * good.
	 */
	async dispatch(lostItemId: string): Promise<void> {
		await this.queue.add(
			FIND_MATCHES_JOB,
			{ lostItemId },
			{
				attempts: MATCHING_ATTEMPTS,
				backoff: { type: 'exponential', delay: MATCHING_BACKOFF_DELAY_MS },
				removeOnComplete: { count: MATCHING_KEEP_COMPLETED },
				removeOnFail: { age: MATCHING_KEEP_FAILED_SECONDS },
			},
		)
	}
}
