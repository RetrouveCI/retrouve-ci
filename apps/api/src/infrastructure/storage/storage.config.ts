import type { CloudinaryCredentials } from '@/libs/storage/cloudinary'

export interface StorageConfig extends CloudinaryCredentials {
	folder: string
}

const DEFAULT_FOLDER = 'retrouve-ci/lost-items'

export function loadStorageConfig(): StorageConfig {
	const cloudName = process.env['CLOUDINARY_CLOUD_NAME']
	const apiKey = process.env['CLOUDINARY_API_KEY']
	const apiSecret = process.env['CLOUDINARY_API_SECRET']

	if (!cloudName || !apiKey || !apiSecret) {
		throw new Error(
			'Configuration Cloudinary manquante : définissez CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET',
		)
	}

	return {
		cloudName,
		apiKey,
		apiSecret,
		folder: process.env['CLOUDINARY_FOLDER'] ?? DEFAULT_FOLDER,
	}
}
