import { resolveRouteMeta } from '../page-meta'

describe('resolveRouteMeta', () => {
	it('returns the title of the deepest route declaring one', () => {
		expect(
			resolveRouteMeta([
				{ handle: { title: 'Tableau de bord' } },
				{ handle: { title: 'Annonces' } },
			]),
		).toEqual({ title: 'Annonces', breadcrumb: [] })
	})

	it('walks up past routes that declare no title', () => {
		expect(
			resolveRouteMeta([
				{ handle: { title: 'Annonces' } },
				{ handle: {} },
				{},
				undefined,
			]),
		).toEqual({ title: 'Annonces', breadcrumb: [] })
	})

	it('derives the title from the loader data when it is a function', () => {
		expect(
			resolveRouteMeta([
				{
					handle: {
						title: (data: unknown) => (data as { code: string }).code,
					},
					data: { code: 'QR-1234' },
				},
			]),
		).toEqual({ title: 'QR-1234', breadcrumb: [] })
	})

	it('returns the breadcrumb declared alongside the title', () => {
		const breadcrumb = [{ label: 'QR', to: '/qr' }]

		expect(
			resolveRouteMeta([{ handle: { title: 'QR-1234', breadcrumb } }]),
		).toEqual({ title: 'QR-1234', breadcrumb })
	})

	it('returns an empty meta when no route declares a title', () => {
		expect(resolveRouteMeta([])).toEqual({ title: '', breadcrumb: [] })
		expect(resolveRouteMeta([{ handle: { breadcrumb: [] } }])).toEqual({
			title: '',
			breadcrumb: [],
		})
	})
})
