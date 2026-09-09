/** `errors` is what `ZodValidationPipe` and `DomainExceptionFilter` both send. */
export interface ApiErrorBody {
	statusCode: number
	message: string | string[]
	error?: string
	errors?: Record<string, string[]>
}

export type ApiFieldErrors = Record<string, string[]>

export class ApiError extends Error {
	readonly status: number
	/** Read by nobody until R55: every message reached a form as a banner. */
	readonly fieldErrors: ApiFieldErrors

	constructor(
		status: number,
		message: string,
		fieldErrors: ApiFieldErrors = {},
	) {
		super(message)
		this.name = 'ApiError'
		this.status = status
		this.fieldErrors = fieldErrors
	}
}

export function toApiErrorMessage(
	body: ApiErrorBody,
	fallback: string,
): string {
	if (Array.isArray(body.message)) {
		return body.message.join(', ')
	}
	return body.message || fallback
}
