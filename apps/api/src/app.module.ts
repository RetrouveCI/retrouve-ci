import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './infrastructure/database/prisma.module'
import { QueueModule } from './infrastructure/queue/queue.module'
import { HealthController } from './shared/presentation/health/health.controller'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		PrismaModule,
		QueueModule,
	],
	controllers: [HealthController],
})
export class AppModule {}
