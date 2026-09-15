import { Body, Controller, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import {
	interpretSearchPhraseSchema,
	type InterpretSearchPhraseData,
} from '@app/contracts/search-assistant'
import { AllowAnonymous } from '@thallesp/nestjs-better-auth'
import { InterpretSearchPhraseUseCase } from '@/domains/search-assistant/use-cases/interpret-search-phrase.use-case'
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe'
import { ApiZodBody } from '@/shared/swagger/api-zod.decorator'

@ApiTags('search-assistant')
@Controller('search-assistant')
export class SearchAssistantController {
	constructor(
		private readonly interpretSearchPhrase: InterpretSearchPhraseUseCase,
	) {}

	/**
	 * A POST because the phrase is a body and not a query: it is what a visitor
	 * lost, and a query string is logged by every hop on the way. Anonymous, so
	 * the assistant meets the visitor who has just lost something rather than the
	 * one who already has an account — bounded by the `assistant` bucket per
	 * caller and by `ASSISTANT_MONTHLY` for the installation.
	 */
	@Post('interpret')
	@AllowAnonymous()
	@ApiZodBody(interpretSearchPhraseSchema)
	interpret(
		@Body(new ZodValidationPipe(interpretSearchPhraseSchema))
		data: InterpretSearchPhraseData,
	) {
		return this.interpretSearchPhrase.execute(data.phrase)
	}
}
