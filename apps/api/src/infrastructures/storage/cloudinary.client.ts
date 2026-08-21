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

export function uploadImageBuffer(
	buffer: Buffer,
	options: { folder: string },
): Promise<UploadedImage> {
	return new Promise((resolve, reject) => {
		const stream = cloudinary.uploader.upload_stream(
			{
				folder: options.folder,
				resource_type: 'image',
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
