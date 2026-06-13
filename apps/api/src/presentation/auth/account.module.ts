import { Module } from '@nestjs/common'
import { AccountController } from './controllers/account.controller'

@Module({
	controllers: [AccountController],
})
export class AccountModule {}
