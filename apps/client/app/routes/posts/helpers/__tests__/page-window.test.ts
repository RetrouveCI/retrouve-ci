import {
	buildPageWindow,
	buildResponsiveWindow,
	type PageSlot,
	type ResponsiveSlot,
} from '../page-window'

const show = (slots: PageSlot[]) =>
	slots.map(slot => (slot === 'ellipsis' ? '…' : slot)).join(' ')

describe('buildPageWindow', () => {
	it('draws the compact window the plan asks for', () => {
		expect(show(buildPageWindow(8, 40))).toBe('1 … 7 8 9 … 40')
	})

	it('lists every page while the ellipses would stand for nothing', () => {
		expect(show(buildPageWindow(4, 7))).toBe('1 2 3 4 5 6 7')
		expect(show(buildPageWindow(3, 5, 0))).toBe('1 2 3 4 5')
	})

	it('shifts the window inwards at the edges instead of narrowing it', () => {
		expect(show(buildPageWindow(1, 40))).toBe('1 2 3 4 … 40')
		expect(show(buildPageWindow(40, 40))).toBe('1 … 37 38 39 40')
	})

	// The phone renders `span: 0` and `sm` upwards `span: 1`, so the two windows
	// are what keeps the bar inside 360 px without a media query.
	it('narrows to three numbers at span 0', () => {
		expect(show(buildPageWindow(8, 40, 0))).toBe('1 … 8 … 40')
	})

	/**
	 * The width is the whole point: one button per page is what R9 replaces. Five
	 * numbers at `span: 1`, three at `span: 0`, whatever the total.
	 */
	it.each([
		[0, 3],
		[1, 5],
	])('never draws more than the span %i budget of %i numbers', (span, max) => {
		for (let total = 8; total <= 200; total += 7)
			for (let page = 1; page <= total; page++)
				expect(
					buildPageWindow(page, total, span).filter(slot => slot !== 'ellipsis')
						.length,
				).toBeLessThanOrEqual(max)
	})

	it('never repeats a page, and always climbs', () => {
		for (let total = 1; total <= 60; total++)
			for (let page = 1; page <= total; page++) {
				const pages = buildPageWindow(page, total).filter(
					(slot): slot is number => slot !== 'ellipsis',
				)
				expect(pages).toStrictEqual([...new Set(pages)])
				expect(pages).toStrictEqual([...pages].sort((a, b) => a - b))
			}
	})

	it('always offers the first and the last page', () => {
		for (let total = 1; total <= 60; total++)
			for (let page = 1; page <= total; page++) {
				const slots = buildPageWindow(page, total)
				expect(slots.at(0)).toBe(1)
				expect(slots.at(-1)).toBe(total)
			}
	})

	it('always offers the current page, so the bar can light one', () => {
		for (let total = 1; total <= 60; total++)
			for (let page = 1; page <= total; page++)
				expect(buildPageWindow(page, total)).toContain(page)
	})

	/**
	 * `page` comes from the address bar, where anything can be typed. The window
	 * clamps rather than rendering a page nobody can reach.
	 */
	it('clamps a page the URL invented', () => {
		expect(show(buildPageWindow(0, 40))).toBe('1 2 3 4 … 40')
		expect(show(buildPageWindow(99, 40))).toBe('1 … 37 38 39 40')
	})

	it('survives an empty listing', () => {
		expect(buildPageWindow(1, 0)).toStrictEqual([1])
	})
})

/**
 * The merged list has to render, at each breakpoint, exactly what the plain
 * window produces for that breakpoint's span — that is the whole contract.
 */
const at = (slots: ResponsiveSlot[], view: 'mobile' | 'desktop') =>
	slots
		.filter(slot =>
			slot.kind === 'page'
				? view === 'desktop' || slot.mobile
				: view === 'desktop'
					? slot.desktop
					: slot.mobile,
		)
		.map(slot => (slot.kind === 'gap' ? '…' : slot.page))
		.join(' ')

describe('buildResponsiveWindow', () => {
	it('reads as the plan asks on each side of the breakpoint', () => {
		const slots = buildResponsiveWindow(8, 40)

		expect(at(slots, 'desktop')).toBe('1 … 7 8 9 … 40')
		expect(at(slots, 'mobile')).toBe('1 … 8 … 40')
	})

	// Two buttons named « Page 8 » is what rendering two windows would cost.
	it('puts every page in the document exactly once', () => {
		for (let total = 1; total <= 60; total++)
			for (let page = 1; page <= total; page++) {
				const pages = buildResponsiveWindow(page, total)
					.filter(slot => slot.kind === 'page')
					.map(slot => (slot.kind === 'page' ? slot.page : 0))

				expect(pages).toStrictEqual([...new Set(pages)])
			}
	})

	it.each([
		['mobile', 0],
		['desktop', 1],
	] as const)(
		'renders the %s view identically to span %i, at every page of every total',
		(view, span) => {
			for (let total = 1; total <= 60; total++)
				for (let page = 1; page <= total; page++)
					expect(at(buildResponsiveWindow(page, total), view)).toBe(
						show(buildPageWindow(page, total, span)),
					)
		},
	)

	/**
	 * The blemish that rendering one window and hiding its middle would have
	 * left: a gap the desktop does not need, because the pages it stands for are
	 * only hidden below `sm`.
	 */
	it('gives a view its own gap when only that view needs one', () => {
		const slots = buildResponsiveWindow(3, 40)

		expect(at(slots, 'desktop')).toBe('1 2 3 4 … 40')
		expect(at(slots, 'mobile')).toBe('1 … 3 … 40')
		expect(slots).toContainEqual({ kind: 'gap', mobile: true, desktop: false })
	})

	it('draws no gap at all while every page fits both views', () => {
		expect(
			buildResponsiveWindow(3, 5).every(slot => slot.kind === 'page'),
		).toBe(true)
	})
})
