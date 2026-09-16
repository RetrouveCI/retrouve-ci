import { useSearchParams } from 'react-router'
import { format } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import { DateRangePicker } from '@/components/date-range-picker'

/**
 * The period a list filters on, in the URL like every other filter here — so a
 * view is shared by its link and the loader is what reads it. F9a took this
 * control away because it filtered the loaded page in memory; it comes back
 * only now that the API bounds the query itself.
 *
 * The keys are `dateFrom` / `dateTo`, the contracts' own spelling. The
 * dashboard keeps `from` / `to`: it names a measurement period rather than a
 * list filter, and its links are already out there.
 */
export function ListDateFilter() {
	const [searchParams, setSearchParams] = useSearchParams()

	const from = searchParams.get('dateFrom')
	const to = searchParams.get('dateTo')

	const dateRange: DateRange | undefined = from
		? { from: new Date(from), to: to ? new Date(to) : undefined }
		: undefined

	const change = (range: DateRange | undefined) => {
		const next = new URLSearchParams(searchParams)

		if (range?.from) next.set('dateFrom', format(range.from, 'yyyy-MM-dd'))
		else next.delete('dateFrom')
		if (range?.to) next.set('dateTo', format(range.to, 'yyyy-MM-dd'))
		else next.delete('dateTo')

		// A new filter always returns to the first page (F9a).
		next.delete('page')

		setSearchParams(next)
	}

	return <DateRangePicker dateRange={dateRange} onDateRangeChange={change} />
}
