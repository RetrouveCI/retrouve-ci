import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from '@/infrastructure/auth/auth.module'
import { PrismaModule } from '@/infrastructure/database/prisma.module'
import { QueueModule } from '@/infrastructure/queue/queue.module'
import { HealthModule } from '@/presentation/health/health.module'
import { LostItemsModule } from '@/presentation/lost-items/lost-items.module'
import { MatchingModule } from '@/presentation/matching/matching.module'
import { QrCodesModule } from '@/presentation/qr-codes/qr-codes.module'
import { StickerOrdersModule } from '@/presentation/sticker-orders/sticker-orders.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		PrismaModule,
		QueueModule,
		HealthModule,
		AuthModule,
		LostItemsModule,
		MatchingModule,
		QrCodesModule,
		StickerOrdersModule,
	],
})
export class AppModule {}
