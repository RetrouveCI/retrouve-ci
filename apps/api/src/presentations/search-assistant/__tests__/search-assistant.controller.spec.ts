import { describe, expect, it, vi } from 'vitest'
import { interpretSearchPhraseSchema } from '@app/contracts/search-assistant'
import type { InterpretSearchPhraseUseCase } from '@/domains/search-assistant/use-cases/interpret-search-phrase.use-case'
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe'
import { SearchAssistantController } from '../search-assistant.controller'

const INTERPRETED = { status: 'interpreted', filters: { type: 'lost' } }

function buildController() {
	const execute = vi.fn().mockResolvedValue(INTERPRETED)
	const controller = new SearchAssistantController({
		execute,
	} as unknown as InterpretSearchPhraseUseCase)

	return { controller, execute }
}

const pipe = new ZodValidationPipe(interpretSearchPhraseSchema)

describe('the interpretation route', () => {
	it('hands the use-case the phrase alone', async () => {
		const { controller, execute } = buildController()

		const result = await controller.interpret({ phrase: 'ma carte perdue' })

		expect(execute).toHaveBeenCalledWith('ma carte perdue')
		expect(result).toEqual(INTERPRETED)
	})

	it('refuses a phrase too short to mean anything', () => {
		expect(() => pipe.transform({ phrase: 'a' })).toThrow()
	})

	// The pipe strips what the schema does not know, so a caller cannot smuggle
	// a second field past a route that reads one.
	it('keeps nothing but the phrase', () => {
		const data = pipe.transform({ phrase: 'ma carte perdue', model: 'other' })

		expect(data).toEqual({ phrase: 'ma carte perdue' })
	})
})
