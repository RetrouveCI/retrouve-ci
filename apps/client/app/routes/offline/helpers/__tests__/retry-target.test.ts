import { retryTarget } from '../retry-target'

describe('where « Réessayer » goes', () => {
	it('goes back to the page the worker could not serve', () => {
		expect(retryTarget('/posts/abc-123')).toBe('/posts/abc-123')
	})

	it('keeps the query, which a filtered list needs', () => {
		expect(retryTarget('/posts?page=2&ville=Abidjan')).toBe(
			'/posts?page=2&ville=Abidjan',
		)
	})

	it('falls back to the home page when nothing was carried', () => {
		expect(retryTarget(null)).toBe('/')
	})

	it.each([
		['an absolute URL', 'https://evil.example/steal'],
		['a protocol-relative host', '//evil.example'],
		['a path that is no path', 'posts/abc'],
	])('refuses %s', (_name, from) => {
		expect(retryTarget(from)).toBe('/')
	})

	it('refuses an auth page, which would read as a login loop', () => {
		expect(retryTarget('/login')).toBe('/')
	})

	it('refuses a loader payload, which would serve raw data', () => {
		expect(retryTarget('/posts/abc.data')).toBe('/')
	})
})
