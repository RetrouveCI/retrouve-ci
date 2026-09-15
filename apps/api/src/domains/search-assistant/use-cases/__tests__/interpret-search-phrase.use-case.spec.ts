import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AssistantConfig } from '@/infrastructures/assistant/assistant.config'
import type { ClaudeClient } from '@/infrastructures/assistant/claude.client'
import { ASSISTANT_MONTHLY } from '@/shared/rate-limit/rate-limit.policy'
import type { SpendBudget } from '@/shared/rate-limit/spend-budget.service'
import { InterpretSearchPhraseUseCase } from '../interpret-search-phrase.use-case'

const extract = vi.fn()
const allows = vi.fn()

function useCaseWith(isConfigured = true) {
	return new InterpretSearchPhraseUseCase(
		{ isConfigured } as AssistantConfig,
		{ extract } as unknown as ClaudeClient,
		{ allows } as unknown as SpendBudget,
	)
}

const UNAVAILABLE = { status: 'unavailable', filters: {} }

beforeEach(() => {
	allows.mockReset().mockResolvedValue(true)
	extract
		.mockReset()
		.mockResolvedValue({ status: 'extracted', text: '{"type":"lost"}' })
})

describe('interpreting a phrase', () => {
	it('answers the filters the model named', async () => {
		const result = await useCaseWith().execute('ma carte perdue')

		expect(result).toEqual({ status: 'interpreted', filters: { type: 'lost' } })
	})

	// `interpreted` with nothing in it is what lets the front say « je n'ai pas
	// compris » rather than « indisponible », which means something else.
	it('stays interpreted when the model found nothing to filter on', async () => {
		extract.mockResolvedValue({ status: 'extracted', text: '{}' })

		const result = await useCaseWith().execute('bonjour')

		expect(result).toEqual({ status: 'interpreted', filters: {} })
	})

	it('hands the gateway the phrase and an invite naming the places', async () => {
		await useCaseWith().execute('ma carte perdue')

		expect(extract).toHaveBeenCalledWith(
			expect.stringContaining('Abidjan'),
			'ma carte perdue',
		)
	})
})

describe('the replis, none of which is a panne', () => {
	it('answers unavailable with no key set, and spends no budget for it', async () => {
		const result = await useCaseWith(false).execute('ma carte perdue')

		expect(result).toEqual(UNAVAILABLE)
		expect(allows).not.toHaveBeenCalled()
		expect(extract).not.toHaveBeenCalled()
	})

	it('answers unavailable once the month is spent, without calling', async () => {
		allows.mockResolvedValue(false)

		const result = await useCaseWith().execute('ma carte perdue')

		expect(result).toEqual(UNAVAILABLE)
		expect(extract).not.toHaveBeenCalled()
	})

	it.each(['failed', 'unconfigured'])(
		'answers unavailable when the gateway is %s',
		async status => {
			extract.mockResolvedValue({ status })

			expect(await useCaseWith().execute('ma carte perdue')).toEqual(
				UNAVAILABLE,
			)
		},
	)
})

describe('the month it counts against', () => {
	it('counts the call before making it, so a burst cannot overshoot', async () => {
		const order: string[] = []

		allows.mockImplementation(() => {
			order.push('budget')
			return Promise.resolve(true)
		})
		extract.mockImplementation(() => {
			order.push('gateway')
			return Promise.resolve({ status: 'failed' })
		})

		await useCaseWith().execute('ma carte perdue')

		expect(order).toEqual(['budget', 'gateway'])
	})

	it('spends from the installation ceiling and no other', async () => {
		await useCaseWith().execute('ma carte perdue')

		expect(allows).toHaveBeenCalledWith(ASSISTANT_MONTHLY)
	})
})
