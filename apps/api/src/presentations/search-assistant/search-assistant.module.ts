import { Module } from '@nestjs/common'
import { SearchAssistantDomainModule } from '@/domains/search-assistant/search-assistant-domain.module'
import { SearchAssistantController } from './search-assistant.controller'

@Module({
	imports: [SearchAssistantDomainModule],
	controllers: [SearchAssistantController],
})
export class SearchAssistantModule {}
