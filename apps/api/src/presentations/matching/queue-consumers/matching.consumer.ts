import { Processor, WorkerHost } from '@nestjs/bullmq'
import type { Job } from 'bullmq'
import { NotifyMatchesUseCase } from '@/domains/matching/use-cases/notify-matches.use-case'
import { MATCHING_QUEUE } from '@/infrastructures/queue/queue.constants'

interface FindMatchesJobData {
	lostItemId: string
}

@Processor(MATCHING_QUEUE)
export class MatchingConsumer extends WorkerHost {
	constructor(private readonly notifyMatchesUseCase: NotifyMatchesUseCase) {
		super()
	}

	async process(job: Job<FindMatchesJobData>): Promise<void> {
		await this.notifyMatchesUseCase.execute(job.data.lostItemId)
	}
}
