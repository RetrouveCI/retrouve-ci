import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from '@/infrastructures/auth/auth.module'
import { PrismaModule } from '@/infrastructures/database/prisma.module'
import { PushModule } from '@/infrastructures/push/push.module'
import { QueueModule } from '@/infrastructures/queue/queue.module'
import { SmsModule } from '@/infrastructures/sms/sms.module'
import { SeederModule } from '@/infrastructures/seeder/seeder.module'
import { AccountModule } from '@/presentations/auth/account.module'
import { ContactMessagesModule } from '@/presentations/contact-messages/contact-messages.module'
import { EventsModule } from '@/presentations/events/events.module'
import { HealthModule } from '@/presentations/health/health.module'
import { ListingCommentsModule } from '@/presentations/listing-comments/listing-comments.module'
import { LostItemsModule } from '@/presentations/lost-items/lost-items.module'
import { MatchingModule } from '@/presentations/matching/matching.module'
import { NotificationsModule } from '@/presentations/notifications/notifications.module'
import { QrCodesModule } from '@/presentations/qr-codes/qr-codes.module'
import { StickerOrdersModule } from '@/presentations/sticker-orders/sticker-orders.module'
import { StatsModule } from '@/presentations/stats/stats.module'
import { UploadsModule } from '@/presentations/uploads/uploads.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		PrismaModule,
		PushModule,
		QueueModule,
		SmsModule,
		SeederModule,
		HealthModule,
		AuthModule,
		AccountModule,
		ContactMessagesModule,
		EventsModule,
		ListingCommentsModule,
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
