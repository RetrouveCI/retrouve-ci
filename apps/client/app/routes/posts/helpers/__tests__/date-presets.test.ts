import { matchDateFilter, presetDateFrom } from '../date-presets'

// A fixed « today », so the assertions do not drift with the calendar.
const TODAY = new Date('2026-08-31T09:30:00')

describe('presetDateFrom', () => {
	it('counts back from the start of the day, not from the current hour', () => {
		expect(presetDateFrom('7d', TODAY)).toBe('2026-08-24')
		expect(presetDateFrom('30d', TODAY)).toBe('2026-08-01')
	})
})

describe('matchDateFilter', () => {
	it('reads no date at all as « Tout »', () => {
		expect(matchDateFilter(null, null, TODAY)).toBe('all')
	})

	it.each([['7d'], ['30d']] as const)(
		'recognises the range %s wrote, so the pill it filled stays lit',
		preset => {
			expect(matchDateFilter(presetDateFrom(preset, TODAY), null, TODAY)).toBe(
				preset,
			)
		},
	)

	it('calls any other single boundary a custom range', () => {
		expect(matchDateFilter('2026-07-04', null, TODAY)).toBe('custom')
	})

	// A preset never sets an upper bound, so one can only come from the calendar.
	it('calls a two-sided range custom, even on a preset boundary', () => {
		expect(
			matchDateFilter(presetDateFrom('7d', TODAY), '2026-08-28', TODAY),
		).toBe('custom')
	})

	it('calls an upper bound with no lower bound custom rather than « Tout »', () => {
		expect(matchDateFilter(null, '2026-08-28', TODAY)).toBe('custom')
	})
})
