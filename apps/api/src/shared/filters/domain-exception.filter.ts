import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpStatus,
} from '@nestjs/common'
import type { Response } from 'express'
import {
	DomainError,
	NotFoundError,
	ValidationError,
} from '../errors/domain.error'

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
	catch(exception: DomainError, host: ArgumentsHost) {
		const response = host.switchToHttp().getResponse<Response>()

		const status =
			exception instanceof NotFoundError
				? HttpStatus.NOT_FOUND
				: exception instanceof ValidationError
					? HttpStatus.BAD_REQUEST
					: HttpStatus.INTERNAL_SERVER_ERROR

		response.status(status).json({
			statusCode: status,
			message: exception.message,
			error: exception.name,
		})
	}
}
