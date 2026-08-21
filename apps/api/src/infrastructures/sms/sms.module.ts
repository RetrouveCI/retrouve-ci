import { Global, Module } from '@nestjs/common'
import { LetextoConfig } from './letexto.config'
import { LetextoService } from './letexto.service'

@Global()
@Module({
	providers: [LetextoConfig, LetextoService],
	exports: [LetextoService],
})
export class SmsModule {}
