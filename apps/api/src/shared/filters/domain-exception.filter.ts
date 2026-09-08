import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpStatus,
} from '@nestjs/common'
import type { FastifyReply } from 'fastify'
import {
	DomainError,
	ForbiddenError,
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
					: exception instanceof ForbiddenError
						? HttpStatus.FORBIDDEN
						: HttpStatus.INTERNAL_SERVER_ERROR

		// The same `errors` map `ZodValidationPipe` answers with, so a front reads
		// one shape whether the refusal came from the schema or from the domain.
		const field =
			exception instanceof ValidationError ? exception.field : undefined

		response.status(status).send({
			statusCode: status,
			message: exception.message,
			error: exception.name,
			...(field && { errors: { [field]: [exception.message] } }),
		})
	}
}
