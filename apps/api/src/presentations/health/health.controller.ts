import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AllowAnonymous } from '@thallesp/nestjs-better-auth'

@ApiTags('health')
@Controller('health')
@AllowAnonymous()
export class HealthController {
	@Get()
	check() {
		return { status: 'ok' }
	}
}
