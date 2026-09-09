import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary'

export interface CloudinaryCredentials {
	cloudName: string
	apiKey: string
	apiSecret: string
}

export interface UploadedImage {
	url: string
	publicId: string
}

export function configureCloudinary(credentials: CloudinaryCredentials): void {
	cloudinary.config({
		cloud_name: credentials.cloudName,
		api_key: credentials.apiKey,
		api_secret: credentials.apiSecret,
		secure: true,
	})
}

// Above the widest the front asks for (1600 device pixels). `MAX_PHOTO_SIZE`
// bounds bytes, not pixels: 5 Mo of JPEG can be 6000 px wide.
export const MAX_STORED_PHOTO_WIDTH = 2000

export function uploadImageBuffer(
	buffer: Buffer,
	options: { folder: string },
): Promise<UploadedImage> {
	return new Promise((resolve, reject) => {
		const stream = cloudinary.uploader.upload_stream(
			{
				folder: options.folder,
				resource_type: 'image',
				// ⚠️ Incoming, not `eager`: an eager transformation pre-generates extra
				// derivatives and leaves the master at full size. `c_limit` never
				// upscales, and no `q_auto` — the display URL applies one.
				transformation: [{ width: MAX_STORED_PHOTO_WIDTH, crop: 'limit' }],
			},
			(error, result?: UploadApiResponse) => {
				if (error || !result) {
					reject(error ?? new Error('Cloudinary upload failed'))
					return
				}

				resolve({ url: result.secure_url, publicId: result.public_id })
			},
		)

		stream.end(buffer)
	})
}
