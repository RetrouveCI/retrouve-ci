import { beforeEach, describe, expect, it, vi } from 'vitest'

const { uploadStream, config } = vi.hoisted(() => ({
	uploadStream: vi.fn(),
	config: vi.fn(),
}))

vi.mock('cloudinary', () => ({
	v2: { config, uploader: { upload_stream: uploadStream } },
}))

// Static: this workspace is CJS, so a top-level `await import` is refused.
import { MAX_STORED_PHOTO_WIDTH, uploadImageBuffer } from '../cloudinary.client'

/** Answers the callback as the SDK does, then hands back the options. */
function captureUpload() {
	uploadStream.mockImplementation((options, callback) => {
		queueMicrotask(() =>
			callback(undefined, {
				secure_url: 'https://res.cloudinary.com/demo/image/upload/v1/a.jpg',
				public_id: 'folder/a',
			}),
		)

		return { end: vi.fn() }
	})

	return () => uploadStream.mock.calls[0]?.[0]
}

describe('uploadImageBuffer', () => {
	beforeEach(() => {
		uploadStream.mockReset()
	})

	it('answers the stored URL and its public id', async () => {
		captureUpload()

		expect(
			await uploadImageBuffer(Buffer.from('bytes'), { folder: 'folder' }),
		).toEqual({
			url: 'https://res.cloudinary.com/demo/image/upload/v1/a.jpg',
			publicId: 'folder/a',
		})
	})

	// ⚠️ The one thing `eager` would not do: bound what is stored.
	it('bounds the stored master with an incoming transformation', async () => {
		const options = captureUpload()

		await uploadImageBuffer(Buffer.from('bytes'), { folder: 'folder' })

		expect(options()).toMatchObject({
			folder: 'folder',
			resource_type: 'image',
			transformation: [{ width: MAX_STORED_PHOTO_WIDTH, crop: 'limit' }],
		})
		expect(options()).not.toHaveProperty('eager')
	})

	it('limits rather than fills, so nothing is upscaled', async () => {
		const options = captureUpload()

		await uploadImageBuffer(Buffer.from('bytes'), { folder: 'folder' })

		expect(options().transformation[0].crop).toBe('limit')
	})

	it('bakes no quality pass into the master', async () => {
		const options = captureUpload()

		await uploadImageBuffer(Buffer.from('bytes'), { folder: 'folder' })

		expect(options().transformation[0]).not.toHaveProperty('quality')
		expect(options().transformation[0]).not.toHaveProperty('fetch_format')
	})

	it('rejects when the SDK reports a failure', async () => {
		uploadStream.mockImplementation((_options, callback) => {
			queueMicrotask(() => callback(new Error('cloudinary down'), undefined))
			return { end: vi.fn() }
		})

		await expect(
			uploadImageBuffer(Buffer.from('bytes'), { folder: 'folder' }),
		).rejects.toThrow('cloudinary down')
	})

	it('rejects when the SDK answers neither error nor result', async () => {
		uploadStream.mockImplementation((_options, callback) => {
			queueMicrotask(() => callback(undefined, undefined))
			return { end: vi.fn() }
		})

		await expect(
			uploadImageBuffer(Buffer.from('bytes'), { folder: 'folder' }),
		).rejects.toThrow('Cloudinary upload failed')
	})
})
