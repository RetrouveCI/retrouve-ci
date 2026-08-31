import { imageUrl } from '../image'

const CLOUD = 'https://res.cloudinary.com/retrouveci/image/upload'

describe('imageUrl', () => {
	it('inserts the transformation after /upload/', () => {
		expect(
			imageUrl(`${CLOUD}/v1712345678/lost-items/abc123.jpg`, { width: 160 }),
		).toBe(
			`${CLOUD}/f_auto,q_auto,c_limit,w_160/v1712345678/lost-items/abc123.jpg`,
		)
	})

	// `upload_stream` returns a version, but a URL pasted by hand may not carry one.
	it('does not need a version segment', () => {
		expect(imageUrl(`${CLOUD}/lost-items/abc123.jpg`, { width: 800 })).toBe(
			`${CLOUD}/f_auto,q_auto,c_limit,w_800/lost-items/abc123.jpg`,
		)
	})

	// The helper is applied at call sites, so applying it twice must not stack.
	it('replaces its own transformation rather than stacking one', () => {
		const once = imageUrl(`${CLOUD}/v1/a.jpg`, { width: 160 })

		expect(imageUrl(once, { width: 320 })).toBe(
			`${CLOUD}/f_auto,q_auto,c_limit,w_320/v1/a.jpg`,
		)
	})

	it('asks for a width in device pixels, verbatim', () => {
		expect(imageUrl(`${CLOUD}/v1/a.jpg`, { width: 112 })).toContain('w_112/')
	})

	// Anything the helper does not recognise must survive untouched: this is what
	// lets a call site apply it without first knowing where the photo came from.
	it.each([
		[
			'a local object URL from the publish form',
			'blob:http://localhost:3000/9f8e-77',
		],
		['a data URL', 'data:image/png;base64,iVBORw0KGgo='],
		['a static asset', '/logo.png'],
		['another host', 'https://images.example.com/a.jpg'],
		[
			'a Cloudinary URL that is not an upload',
			'https://res.cloudinary.com/x/video/upload/v1/a.mp4',
		],
		['an empty string', ''],
	])('leaves %s alone', (_case, url) => {
		expect(imageUrl(url, { width: 160 })).toBe(url)
	})
})
