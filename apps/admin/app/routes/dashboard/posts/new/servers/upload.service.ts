import { CLIENT_IP_HEADER, callerAddress } from '@app/web-kit/api'
import { MAX_PHOTOS } from '@app/contracts/lost-items'
import { ApiError } from '@/shared/utils/api-fetch'
import { apiUrl } from '@/shared/helpers/env'

/**
 * Uploads the files a submitted form carries and answers their URLs. Capped
 * **before** uploading rather than after: each file is a Cloudinary write, and
 * the sixth one would be stored and then thrown away.
 */
export async function collectPhotoUrls(
	formData: FormData,
	request: Request,
): Promise<string[]> {
	const files = formData
		.getAll('photos')
		.filter((value): value is File => value instanceof File && value.size > 0)
		.slice(0, MAX_PHOTOS)

	return Promise.all(files.map(file => uploadPostPhoto(file, request)))
}

export async function uploadPostPhoto(
	file: File,
	request: Request,
): Promise<string> {
	const body = new FormData()
	body.append('photo', file)

	const address = callerAddress(request)

	// A raw `fetch`, not `apiFetch`: the multipart boundary must be the one
	// `FormData` picked, so no `Content-Type` may be set — and the headers
	// `apiFetch` would have added are spelled out, the audience above all. A
	// server-side call carries no `Origin`, so without it the API would read the
	// public session and answer 401 to an administrator.
	const response = await fetch(`${apiUrl()}/uploads/lost-item-photo`, {
		method: 'POST',
		body,
		headers: {
			Cookie: request.headers.get('cookie') ?? '',
			'X-Auth-Audience': 'admin',
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

	const { url } = (await response.json()) as { url: string }

	return url
}
