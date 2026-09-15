import { Module } from '@nestjs/common'
import { RateLimitModule } from '@/shared/rate-limit/rate-limit.module'
import { InterpretSearchPhraseUseCase } from './use-cases/interpret-search-phrase.use-case'

/** No repository: this domain owns no row and reads none. */
@Module({
	imports: [RateLimitModule],
	providers: [InterpretSearchPhraseUseCase],
	exports: [InterpretSearchPhraseUseCase],
})
export class SearchAssistantDomainModule {}
