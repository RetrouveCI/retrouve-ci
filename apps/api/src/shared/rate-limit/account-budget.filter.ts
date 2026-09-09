import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpStatus,
} from '@nestjs/common'
import type { FastifyReply } from 'fastify'
import { AccountBudgetExceededError } from './account-budget.error'

// The hook's own 429, answered once: a Nest exception carries no header, and a
// filter can reach the reply — which is what let a route drop its `@Res`.
@Catch(AccountBudgetExceededError)
export class AccountBudgetFilter implements ExceptionFilter {
	catch(exception: AccountBudgetExceededError, host: ArgumentsHost) {
		const response = host.switchToHttp().getResponse<FastifyReply>()

		response
			.status(HttpStatus.TOO_MANY_REQUESTS)
			.header('Retry-After', String(exception.retryAfterSeconds))
			.send({
				statusCode: HttpStatus.TOO_MANY_REQUESTS,
				message: exception.message,
				error: 'Too Many Requests',
			})
	}
}
