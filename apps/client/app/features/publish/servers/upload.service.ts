import { ApiError } from '@/shared/lib/api-client'

interface UploadPhotoResponse {
	url: string
}

export async function uploadLostItemPhoto(
	file: File,
	request: Request,
): Promise<string> {
	const body = new FormData()
	body.append('photo', file)

	const response = await fetch(
		`${import.meta.env.VITE_API_URL}/uploads/lost-item-photo`,
		{
			method: 'POST',
			body,
			headers: { Cookie: request.headers.get('cookie') ?? '' },
		},
	)

	if (!response.ok) {
		const errorBody = (await response.json().catch(() => null)) as {
			message?: string | string[]
		} | null
		const message = Array.isArray(errorBody?.message)
			? errorBody.message.join(', ')
			: (errorBody?.message ?? "Échec de l'envoi de l'image")

		throw new ApiError(response.status, message)
	}

	const { url } = (await response.json()) as UploadPhotoResponse

	return url
}
