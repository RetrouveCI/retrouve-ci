import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { type Job, UnrecoverableError } from 'bullmq'
import { NotifyMatchesUseCase } from '@/domains/matching/use-cases/notify-matches.use-case'
import type { FindMatchesJobData } from '@/infrastructures/queue/matching-dispatcher.service'
import {
	MATCHING_ATTEMPTS,
	MATCHING_QUEUE,
} from '@/infrastructures/queue/queue.constants'
import { NotFoundError } from '@/shared/errors/domain.error'

@Processor(MATCHING_QUEUE)
export class MatchingConsumer extends WorkerHost {
	private readonly logger = new Logger(MatchingConsumer.name)

	constructor(private readonly notifyMatchesUseCase: NotifyMatchesUseCase) {
		super()
	}

	async process(job: Job<FindMatchesJobData>): Promise<void> {
		const { lostItemId } = job.data

		try {
			await this.notifyMatchesUseCase.execute(lostItemId)
		} catch (error) {
			this.logger.error(
				`Matching for lost item ${lostItemId} failed on attempt ${job.attemptsMade + 1}/${MATCHING_ATTEMPTS}: ${
					error instanceof Error ? error.message : String(error)
				}`,
			)

			// A listing deleted between publication and this job will not come
			// back, so it must not burn the retries a transient failure needs.
			if (error instanceof NotFoundError) {
				throw new UnrecoverableError(error.message)
			}

			throw error
		}
	}
}
