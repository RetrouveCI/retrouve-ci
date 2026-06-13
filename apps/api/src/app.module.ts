import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './infrastructure/auth/auth.module'
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
		AuthModule,
	],
	controllers: [HealthController],
})
export class AppModule {}
