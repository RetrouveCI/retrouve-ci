interface ApiErrorBody {
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

function toErrorMessage(body: ApiErrorBody, fallback: string): string {
	if (Array.isArray(body.message)) {
		return body.message.join(', ')
	}
	return body.message || fallback
}

export async function apiFetch<T>(
	path: string,
	init?: RequestInit,
): Promise<T> {
	const response = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
		...init,
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
			...init?.headers,
		},
	})

	if (!response.ok) {
		const body = (await response
			.json()
			.catch(() => null)) as ApiErrorBody | null
		throw new ApiError(
			response.status,
			body ? toErrorMessage(body, response.statusText) : response.statusText,
		)
	}

	if (response.status === 204) {
		return undefined as T
	}

	const text = await response.text()
	return text ? (JSON.parse(text) as T) : (undefined as T)
}
