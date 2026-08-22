import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { AccountController } from './controllers/account.controller'
import { OtpConsumer } from './queue-consumers/otp.consumer'
import { OTP_QUEUE } from '@/infrastructures/queue/queue.constants'

@Module({
	imports: [BullModule.registerQueue({ name: OTP_QUEUE })],
	controllers: [AccountController],
	providers: [OtpConsumer],
})
export class AccountModule {}
