import { ApiError } from '@/shared/lib/api-client'
import { MAX_PHOTOS } from '../publish.const'

interface UploadPhotoResponse {
	url: string
}

/**
 * Resolves the final photo URLs for a submitted form: kept remote URLs
 * (`existingPhotos`) plus freshly uploaded files (`photos`), capped at
 * MAX_PHOTOS.
 */
export async function collectPhotoUrls(
	formData: FormData,
	request: Request,
): Promise<string[]> {
	const existing = formData
		.getAll('existingPhotos')
		.filter((value): value is string => typeof value === 'string' && !!value)

	const files = formData
		.getAll('photos')
		.filter((value): value is File => value instanceof File && value.size > 0)

	const uploaded = await Promise.all(
		files.map(file => uploadLostItemPhoto(file, request)),
	)

	return [...existing, ...uploaded].slice(0, MAX_PHOTOS)
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
