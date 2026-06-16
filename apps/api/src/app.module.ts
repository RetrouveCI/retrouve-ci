import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from '@/infrastructure/auth/auth.module'
import { PrismaModule } from '@/infrastructure/database/prisma.module'
import { QueueModule } from '@/infrastructure/queue/queue.module'
import { AccountModule } from '@/presentation/auth/account.module'
import { ContactMessagesModule } from '@/presentation/contact-messages/contact-messages.module'
import { EventsModule } from '@/presentation/events/events.module'
import { HealthModule } from '@/presentation/health/health.module'
import { LostItemsModule } from '@/presentation/lost-items/lost-items.module'
import { MatchingModule } from '@/presentation/matching/matching.module'
import { NotificationsModule } from '@/presentation/notifications/notifications.module'
import { QrCodesModule } from '@/presentation/qr-codes/qr-codes.module'
import { StickerOrdersModule } from '@/presentation/sticker-orders/sticker-orders.module'
import { StatsModule } from '@/presentation/stats/stats.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		PrismaModule,
		QueueModule,
		HealthModule,
		AuthModule,
		AccountModule,
		ContactMessagesModule,
		EventsModule,
		LostItemsModule,
		MatchingModule,
		NotificationsModule,
		QrCodesModule,
		StickerOrdersModule,
		StatsModule,
	],
})
export class AppModule {}
