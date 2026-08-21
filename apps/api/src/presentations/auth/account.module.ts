import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { OTP_QUEUE } from '@/shared/auth/otp.const'
import { AccountController } from './controllers/account.controller'
import { OtpConsumer } from './queue-consumers/otp.consumer'

@Module({
	imports: [BullModule.registerQueue({ name: OTP_QUEUE })],
	controllers: [AccountController],
	providers: [OtpConsumer],
})
export class AccountModule {}
