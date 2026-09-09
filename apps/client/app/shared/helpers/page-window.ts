/** A rendered pagination slot: a page to jump to, or a gap standing for many. */
export type PageSlot = number | 'ellipsis'

/**
 * The window of pages a compact pagination draws — « 1 … 7 8 9 … 40 » rather
 * than one button per page, which overflowed the viewport as soon as the listing
 * grew past a handful of pages.
 *
 * `span` is how many neighbours flank the current page, and it is what makes the
 * bar responsive without a media query: the phone renders `span: 0` (three
 * numbers, five slots) and `sm` upwards renders `span: 1` (five numbers, seven
 * slots). The window keeps its width at the edges by shifting inwards instead of
 * shrinking, so the bar does not resize as someone walks through the pages.
 */
export function buildPageWindow(
	currentPage: number,
	totalPages: number,
	span = 1,
): PageSlot[] {
	const last = Math.max(1, totalPages)
	const current = Math.min(Math.max(1, currentPage), last)

	// Below this, the ellipses would stand for nothing: every page fits.
	if (last <= 2 * span + 5)
		return Array.from({ length: last }, (_, index) => index + 1)

	let from = current - span
	let to = current + span

	if (from < 2) {
		to += 2 - from
		from = 2
	}
	if (to > last - 1) {
		from -= to - (last - 1)
		to = last - 1
	}
	from = Math.max(2, from)

	const slots: PageSlot[] = [1]
	if (from > 2) slots.push('ellipsis')
	for (let page = from; page <= to; page++) slots.push(page)
	if (to < last - 1) slots.push('ellipsis')
	slots.push(last)

	return slots
}

/** A slot in the rendered bar, with the breakpoints it belongs to. */
export type ResponsiveSlot =
	| { kind: 'page'; page: number; mobile: boolean }
	| { kind: 'gap'; mobile: boolean; desktop: boolean }

const pagesOf = (slots: PageSlot[]) =>
	slots.filter((slot): slot is number => slot !== 'ellipsis')

/**
 * Both windows in one list of slots, each marked with the breakpoints it shows
 * at: below `sm` the bar reads `1 … 8 … 40`, from `sm` up `1 … 7 8 9 … 40`.
 *
 * One list rather than two, because two would put every shared page number in
 * the document twice — two buttons named « Page 8 », one of them hidden. CSS is
 * what picks, so the choice survives server rendering; reading `matchMedia`
 * instead would render the wrong window and flash through hydration.
 */
export function buildResponsiveWindow(
	currentPage: number,
	totalPages: number,
): ResponsiveSlot[] {
	const pages = pagesOf(buildPageWindow(currentPage, totalPages, 1))
	const onPhone = new Set(pagesOf(buildPageWindow(currentPage, totalPages, 0)))

	const slots: ResponsiveSlot[] = []
	let previous: number | undefined
	let previousOnPhone: number | undefined

	for (const page of pages) {
		const mobile = onPhone.has(page)
		// A gap stands for the pages between two *visible* neighbours, and the two
		// breakpoints hide different ones — so each view needs its own answer.
		const desktopGap = previous !== undefined && page - previous > 1
		const mobileGap =
			mobile && previousOnPhone !== undefined && page - previousOnPhone > 1

		if (desktopGap || mobileGap)
			slots.push({ kind: 'gap', mobile: mobileGap, desktop: desktopGap })
		slots.push({ kind: 'page', page, mobile })

		previous = page
		if (mobile) previousOnPhone = page
	}

	return slots
}
