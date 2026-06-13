import { Body, Controller, Post, Req } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { AuthService } from '@thallesp/nestjs-better-auth'
import { fromNodeHeaders } from 'better-auth/node'
import type { FastifyRequest } from 'fastify'
import { auth } from '@/infrastructure/auth/auth.config'
import { SetInitialPasswordDto } from '../dto/set-initial-password.dto'

@ApiTags('account')
@ApiBearerAuth()
@Controller('account')
export class AccountController {
	constructor(private readonly authService: AuthService<typeof auth>) {}

	@Post('set-initial-password')
	setInitialPassword(
		@Body() dto: SetInitialPasswordDto,
		@Req() req: FastifyRequest,
	) {
		return this.authService.api.setPassword({
			body: { newPassword: dto.newPassword },
			headers: fromNodeHeaders(req.headers),
		})
	}
}
