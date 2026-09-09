import { format, startOfDay, subDays } from 'date-fns'

/**
 * The four states the « Période » group can be in. `custom` is the only one
 * that shows a calendar; the other three are one tap.
 */
export type DateFilterMode = 'all' | '7d' | '30d' | 'custom'

const PRESET_DAYS: Record<'7d' | '30d', number> = { '7d': 7, '30d': 30 }

export const DATE_PRESET_CHIP_LABELS: Record<'7d' | '30d', string> = {
	'7d': '7 derniers jours',
	'30d': '30 derniers jours',
}

/**
 * Presets are matched and produced in the URL's own string space (`yyyy-MM-dd`),
 * never as `Date`s. `new Date('2026-08-24')` is UTC midnight, which `format()`
 * renders as the previous day anywhere west of Greenwich — so a round trip
 * through `Date` would make a preset stop recognising the range it just wrote.
 */
export function presetDateFrom(
	preset: '7d' | '30d',
	today: Date = new Date(),
): string {
	return format(subDays(startOfDay(today), PRESET_DAYS[preset]), 'yyyy-MM-dd')
}

export function matchDateFilter(
	dateFrom: string | null,
	dateTo: string | null,
	today: Date = new Date(),
): DateFilterMode {
	if (!dateFrom) return dateTo ? 'custom' : 'all'
	if (dateTo) return 'custom'
	if (dateFrom === presetDateFrom('7d', today)) return '7d'
	if (dateFrom === presetDateFrom('30d', today)) return '30d'
	return 'custom'
}
