import { Body, Controller, Post, Req } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { AuthService } from '@thallesp/nestjs-better-auth'
import { fromNodeHeaders } from 'better-auth/node'
import type { FastifyRequest } from 'fastify'
import {
	setInitialPasswordSchema,
	type SetInitialPasswordData,
} from '@app/contracts/auth'
import type { Auth } from '@/infrastructure/auth/auth.config'
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe'
import { ApiZodBody } from '@/shared/swagger/api-zod.decorator'

@ApiTags('account')
@ApiBearerAuth()
@Controller('account')
export class AccountController {
	constructor(private readonly authService: AuthService<Auth>) {}

	@Post('set-initial-password')
	@ApiZodBody(setInitialPasswordSchema)
	setInitialPassword(
		@Body(new ZodValidationPipe(setInitialPasswordSchema))
		data: SetInitialPasswordData,
		@Req() req: FastifyRequest,
	) {
		return this.authService.api.setPassword({
			body: { newPassword: data.newPassword },
			headers: fromNodeHeaders(req.headers),
		})
	}
}
