export interface ApiErrorBody {
	statusCode: number
	message: string | string[]
	error?: string
}

export class ApiError extends Error {
	readonly status: number

	constructor(status: number, message: string) {
		super(message)
		this.name = 'ApiError'
		this.status = status
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
