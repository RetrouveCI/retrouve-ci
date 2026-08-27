import { BullModule } from '@nestjs/bullmq'
import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { buildQueueConnection } from './queue.config'

@Global()
@Module({
	imports: [
		BullModule.forRootAsync({
			inject: [ConfigService],
			useFactory: buildQueueConnection,
		}),
	],
	exports: [BullModule],
})
export class QueueModule {}
