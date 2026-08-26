import { MAX_PHOTOS } from '@app/contracts/lost-items'
import { collectPhotoUrls, uploadLostItemPhoto } from '../upload.service'

const request = () => new Request('http://localhost:3000/publish/lost')

function formDataWith(existing: string[] = [], files: File[] = []): FormData {
	const body = new FormData()
	for (const url of existing) body.append('existingPhotos', url)
	for (const file of files) body.append('photos', file)
	return body
}

const fileNamed = (name: string, size = 10) =>
	new File([new Uint8Array(size)], name, { type: 'image/jpeg' })

/** Answers each upload with a url derived from the file it received. */
function stubUploads() {
	return vi
		.spyOn(globalThis, 'fetch')
		.mockImplementation(async (_url, init) => {
			const sent = (init?.body as FormData).get('photo') as File
			return new Response(JSON.stringify({ url: `https://cdn/${sent.name}` }), {
				status: 200,
				headers: { 'content-type': 'application/json' },
			})
		})
}

afterEach(() => {
	vi.restoreAllMocks()
})

describe('collectPhotoUrls', () => {
	it('reports no photo when the form carries none', async () => {
		const fetchSpy = stubUploads()

		expect(await collectPhotoUrls(formDataWith(), request())).toEqual([])
		expect(fetchSpy).not.toHaveBeenCalled()
	})

	it('keeps the urls an edit did not remove, without re-uploading them', async () => {
		const fetchSpy = stubUploads()

		const urls = await collectPhotoUrls(
			formDataWith(['https://cdn/kept.jpg']),
			request(),
		)

		expect(urls).toEqual(['https://cdn/kept.jpg'])
		expect(fetchSpy).not.toHaveBeenCalled()
	})

	it('uploads the new files and keeps both sets, kept ones first', async () => {
		stubUploads()

		const urls = await collectPhotoUrls(
			formDataWith(['https://cdn/kept.jpg'], [fileNamed('new.jpg')]),
			request(),
		)

		expect(urls).toEqual(['https://cdn/kept.jpg', 'https://cdn/new.jpg'])
	})

	// A browser sends an untouched file input as a zero-byte entry.
	it('ignores an empty file input', async () => {
		const fetchSpy = stubUploads()

		const urls = await collectPhotoUrls(
			formDataWith([], [fileNamed('empty.jpg', 0)]),
			request(),
		)

		expect(urls).toEqual([])
		expect(fetchSpy).not.toHaveBeenCalled()
	})

	it('drops an empty string among the kept urls', async () => {
		stubUploads()

		const urls = await collectPhotoUrls(
			formDataWith(['', 'https://cdn/kept.jpg']),
			request(),
		)

		expect(urls).toEqual(['https://cdn/kept.jpg'])
	})

	it(`caps the result at ${MAX_PHOTOS}`, async () => {
		stubUploads()

		const urls = await collectPhotoUrls(
			formDataWith(
				Array.from(
					{ length: MAX_PHOTOS },
					(_, i) => `https://cdn/kept${i}.jpg`,
				),
				[fileNamed('extra.jpg')],
			),
			request(),
		)

		expect(urls).toHaveLength(MAX_PHOTOS)
		expect(urls).not.toContain('https://cdn/extra.jpg')
	})

	// One failed upload must fail the whole publish rather than silently drop a
	// photo the poster chose.
	it('fails when one upload fails', async () => {
		vi.spyOn(globalThis, 'fetch').mockResolvedValue(
			new Response(JSON.stringify({ message: 'Image trop lourde' }), {
				status: 413,
				headers: { 'content-type': 'application/json' },
			}),
		)

		await expect(
			collectPhotoUrls(formDataWith([], [fileNamed('a.jpg')]), request()),
		).rejects.toThrow('Image trop lourde')
	})
})

describe('uploadLostItemPhoto', () => {
	it('forwards the session cookie so the API accepts the upload', async () => {
		const fetchSpy = stubUploads()
		const req = new Request('http://localhost:3000/publish/lost', {
			headers: { cookie: 'better-auth.session_token=abc' },
		})

		await uploadLostItemPhoto(fileNamed('a.jpg'), req)

		const init = fetchSpy.mock.calls[0]?.[1]
		expect(init?.method).toBe('POST')
		expect(init?.headers).toMatchObject({
			Cookie: 'better-auth.session_token=abc',
		})
	})

	it('reports the message the API gives', async () => {
		vi.spyOn(globalThis, 'fetch').mockResolvedValue(
			new Response(JSON.stringify({ message: 'Format non supporté' }), {
				status: 400,
				headers: { 'content-type': 'application/json' },
			}),
		)

		await expect(
			uploadLostItemPhoto(fileNamed('a.gif'), request()),
		).rejects.toThrow('Format non supporté')
	})

	// The pipe answers `message` as an array; a reader must not see "[object].
	it('joins the several messages a validation failure returns', async () => {
		vi.spyOn(globalThis, 'fetch').mockResolvedValue(
			new Response(JSON.stringify({ message: ['Trop lourde', 'Trop large'] }), {
				status: 400,
				headers: { 'content-type': 'application/json' },
			}),
		)

		await expect(
			uploadLostItemPhoto(fileNamed('a.jpg'), request()),
		).rejects.toThrow('Trop lourde, Trop large')
	})

	// A gateway error can answer html, and the poster still needs a sentence.
	it('falls back to a French message when the body is not json', async () => {
		vi.spyOn(globalThis, 'fetch').mockResolvedValue(
			new Response('<html>502</html>', { status: 502 }),
		)

		await expect(
			uploadLostItemPhoto(fileNamed('a.jpg'), request()),
		).rejects.toThrow("Échec de l'envoi de l'image")
	})
})
