import { Global, Module } from '@nestjs/common'
import { PushConfig } from './push.config'
import { WebPushClient } from './web-push.client'

@Global()
@Module({
	providers: [PushConfig, WebPushClient],
	exports: [WebPushClient],
})
export class PushModule {}
