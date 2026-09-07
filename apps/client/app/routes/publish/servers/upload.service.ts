import { CLIENT_IP_HEADER, callerAddress } from '@app/web-kit/api'
import { ApiError } from '@/shared/utils/api-fetch'
import { MAX_PHOTOS } from '../publish.const'
import { apiUrl } from '@/shared/helpers/env'

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

	// A raw `fetch`, not `apiFetch`: the multipart boundary has to be the one
	// `FormData` picked, so no `Content-Type` may be set. The two headers
	// `apiFetch` would have derived are therefore spelled out.
	const address = callerAddress(request)

	const response = await fetch(`${apiUrl()}/uploads/lost-item-photo`, {
		method: 'POST',
		body,
		headers: {
			Cookie: request.headers.get('cookie') ?? '',
			...(address ? { [CLIENT_IP_HEADER]: address } : {}),
		},
	})

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
