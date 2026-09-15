import { Injectable } from '@nestjs/common'
import type { SearchInterpretation } from '@app/contracts/search-assistant'
import { AssistantConfig } from '@/infrastructures/assistant/assistant.config'
import { ClaudeClient } from '@/infrastructures/assistant/claude.client'
import { ASSISTANT_MONTHLY } from '@/shared/rate-limit/rate-limit.policy'
import { SpendBudget } from '@/shared/rate-limit/spend-budget.service'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { buildExtractionPrompt } from '../helpers/build-extraction-prompt'
import { narrowAssistantFilters } from '../helpers/narrow-filters'

/** Unset, out of budget, unreachable: one repli, and the filters stay open. */
const UNAVAILABLE: SearchInterpretation = {
	status: 'unavailable',
	filters: {},
}

/**
 * Translates a sentence into filters. It reads **no listing** — the model is
 * handed the phrase and the filter set, nothing else — and it classes nothing:
 * `computeMatchScore` searches and orders, as it already does.
 */
@Injectable()
export class InterpretSearchPhraseUseCase implements IDomainUseCase<
	string,
	SearchInterpretation
> {
	constructor(
		private readonly assistantConfig: AssistantConfig,
		private readonly claudeClient: ClaudeClient,
		private readonly spendBudget: SpendBudget,
	) {}

	async execute(phrase: string): Promise<SearchInterpretation> {
		// Before the budget, so an installation with no key set spends none of it.
		if (!this.assistantConfig.isConfigured) return UNAVAILABLE

		// The budget is counted before the call, so a burst cannot overshoot it,
		// and a failed call still counts: a gateway erroring in a loop must not
		// be the one path that spends without being watched.
		if (!(await this.spendBudget.allows(ASSISTANT_MONTHLY))) {
			return UNAVAILABLE
		}

		const outcome = await this.claudeClient.extract(
			buildExtractionPrompt(new Date()),
			phrase,
		)

		if (outcome.status !== 'extracted') return UNAVAILABLE

		return {
			status: 'interpreted',
			filters: narrowAssistantFilters(outcome.text),
		}
	}
}
