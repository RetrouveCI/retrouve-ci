import { Global, Module } from '@nestjs/common'
import { AssistantConfig } from './assistant.config'
import { ClaudeClient } from './claude.client'

@Global()
@Module({
	providers: [AssistantConfig, ClaudeClient],
	exports: [AssistantConfig, ClaudeClient],
})
export class AssistantModule {}
