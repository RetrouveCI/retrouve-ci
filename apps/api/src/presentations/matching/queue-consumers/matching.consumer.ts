import { Processor, WorkerHost } from '@nestjs/bullmq'
import type { Job } from 'bullmq'
import { MATCHING_QUEUE } from '@/domains/matching/constants'
import { MatchingUseCases } from '@/domains/matching/use-cases/matching.use-cases'

interface FindMatchesJobData {
	lostItemId: string
}

@Processor(MATCHING_QUEUE)
export class MatchingConsumer extends WorkerHost {
	constructor(private readonly matchingUseCases: MatchingUseCases) {
		super()
	}

	async process(job: Job<FindMatchesJobData>): Promise<void> {
		await this.matchingUseCases.notifyMatches(job.data.lostItemId)
	}
}
