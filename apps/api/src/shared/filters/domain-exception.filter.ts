import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpStatus,
} from '@nestjs/common'
import type { FastifyReply } from 'fastify'
import {
	DomainError,
	NotFoundError,
	ValidationError,
} from '../errors/domain.error'

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
	catch(exception: DomainError, host: ArgumentsHost) {
		const response = host.switchToHttp().getResponse<FastifyReply>()

		const status =
			exception instanceof NotFoundError
				? HttpStatus.NOT_FOUND
				: exception instanceof ValidationError
					? HttpStatus.BAD_REQUEST
					: HttpStatus.INTERNAL_SERVER_ERROR

		response.status(status).send({
			statusCode: status,
			message: exception.message,
			error: exception.name,
		})
	}
}
