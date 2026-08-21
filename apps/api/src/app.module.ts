import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from '@/infrastructures/auth/auth.module'
import { PrismaModule } from '@/infrastructures/database/prisma.module'
import { QueueModule } from '@/infrastructures/queue/queue.module'
import { SmsModule } from '@/infrastructures/sms/sms.module'
import { SeederModule } from '@/infrastructures/seeder/seeder.module'
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
import { UploadsModule } from '@/presentation/uploads/uploads.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		PrismaModule,
		QueueModule,
		SmsModule,
		SeederModule,
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
		UploadsModule,
	],
})
export class AppModule {}
