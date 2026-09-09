import { createParamDecorator, type ExecutionContext } from '@nestjs/common'
import type { SessionAudience } from '@/shared/auth/session-audience'

// Which app is asking, as `SessionGuard` resolved it. Reading it here rather
// than accepting a parameter is what stops a caller claiming the other audience.
export const Audience = createParamDecorator(
	(_data: unknown, context: ExecutionContext): SessionAudience =>
		context.switchToHttp().getRequest<{ authAudience?: SessionAudience }>()
			.authAudience ?? 'public',
)
