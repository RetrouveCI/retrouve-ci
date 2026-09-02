import {
	isPublicPath,
	pathnameBehindData,
	shellAssetsFrom,
	strategyFor,
	type RequestFacts,
} from '../cache-policy'

const ORIGIN = 'https://retrouveci.example'

function request(
	url: string,
	facts: Partial<Omit<RequestFacts, 'url'>> = {},
): RequestFacts {
	return {
		url: url.startsWith('http') ? url : `${ORIGIN}${url}`,
		method: 'GET',
		mode: 'no-cors',
		destination: '',
		...facts,
	}
}

const navigation = (path: string) => request(path, { mode: 'navigate' })

describe('the public paths', () => {
	it.each(['/', '/posts', '/posts/abc-123', '/about', '/scan', '/offline'])(
		'counts %s as public',
		path => {
			expect(isPublicPath(path)).toBe(true)
		},
	)

	it.each([
		'/account',
		'/account/posts',
		'/notifications',
		'/publish/lost',
		'/q/RCI-4A7F11',
		'/login',
	])('keeps %s out, its render carrying a session', path => {
		expect(isPublicPath(path)).toBe(false)
	})
})

describe('the strategy a request gets', () => {
	it('lets every mutation past untouched', () => {
		expect(strategyFor(request('/posts', { method: 'POST' }), ORIGIN)).toBe(
			'passthrough',
		)
	})

	it('lets the API past, whatever it answers', () => {
		expect(strategyFor(request('https://api.example/lost-items'), ORIGIN)).toBe(
			'passthrough',
		)
	})

	it('keeps a photo served from another origin', () => {
		expect(
			strategyFor(
				request('https://res.cloudinary.com/x/image/upload/v1/a.jpg', {
					destination: 'image',
				}),
				ORIGIN,
			),
		).toBe('image')
	})

	it('reads a hashed asset from the cache first', () => {
		expect(strategyFor(request('/assets/entry.client-Dhf.js'), ORIGIN)).toBe(
			'asset',
		)
	})

	it('leaves the decoder alone: 1.1 MB no offline scan can use', () => {
		expect(strategyFor(request('/assets/zxing_reader-BxB.wasm'), ORIGIN)).toBe(
			'passthrough',
		)
	})

	it('stores a public page', () => {
		expect(strategyFor(navigation('/posts/abc-123'), ORIGIN)).toBe('document')
	})

	it('answers for a private page without storing it', () => {
		expect(strategyFor(navigation('/account/posts'), ORIGIN)).toBe('navigation')
	})

	it('revises a public loader payload after serving it', () => {
		expect(strategyFor(request('/posts/abc-123.data'), ORIGIN)).toBe('data')
	})

	it('never touches a private loader payload', () => {
		expect(strategyFor(request('/account.data?_routes=root'), ORIGIN)).toBe(
			'passthrough',
		)
	})

	it('revises a file out of `public/`, which is served `max-age=0`', () => {
		expect(strategyFor(request('/manifest.webmanifest'), ORIGIN)).toBe('static')
	})
})

describe('the path behind a data request', () => {
	it.each([
		['/posts/abc.data', '/posts/abc'],
		['/posts.data', '/posts'],
		// What `v8_trailingSlashAwareDataRequests` asks for the index route.
		['/.data', '/'],
	])('reads %s as %s', (given, expected) => {
		expect(pathnameBehindData(given)).toBe(expected)
	})
})

describe('the shell read out of a rendered document', () => {
	const html = `<!DOCTYPE html><html><head>
		<link rel="stylesheet" href="/assets/root-Db3.css"/>
		<link rel="modulepreload" href="/assets/manifest-de3.js"/>
		<link rel="preload" as="font" href="/assets/geist-latin-BgD.woff2"/>
		<script type="module" src="/assets/entry.client-Dhf.js"></script>
		<script src="/assets/zxing_reader-BxB.wasm"></script>
		<img src="/logo.png"/>
		<a href="https://cdn.example/assets/other.js">out</a>
	</head></html>`

	it('takes the styles, the preloads and the entry', () => {
		expect(shellAssetsFrom(html)).toEqual([
			'/assets/root-Db3.css',
			'/assets/manifest-de3.js',
			'/assets/geist-latin-BgD.woff2',
			'/assets/entry.client-Dhf.js',
		])
	})

	it('leaves the decoder out, as the fetch policy does', () => {
		expect(shellAssetsFrom(html)).not.toContain('/assets/zxing_reader-BxB.wasm')
	})

	it('names each asset once, however many tags point at it', () => {
		const twice = `<link href="/assets/a.css"/><link href="/assets/a.css"/>`

		expect(shellAssetsFrom(twice)).toEqual(['/assets/a.css'])
	})

	it('answers nothing for a document that names none', () => {
		expect(shellAssetsFrom('<html><body>hello</body></html>')).toEqual([])
	})
})
