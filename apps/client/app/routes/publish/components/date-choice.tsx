import { useState } from 'react'
import { Input } from '@app/ui/components'
import { FilterPill } from '@/components/filter-pill'

type DateMode = 'today' | 'yesterday' | 'other'

/** Local calendar day, not UTC: `toISOString` shifts the day west of Greenwich. */
function isoDay(daysAgo: number): string {
	const date = new Date()
	date.setDate(date.getDate() - daysAgo)

	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')

	return `${date.getFullYear()}-${month}-${day}`
}

interface DateChoiceProps {
	id: string
	value: string
	onChange: (value: string) => void
	onBlur: () => void
	invalid: boolean
}

/**
 * Nearly every listing is posted the day of the loss or the day after, and a
 * native date picker asks for three taps to say so. The two shortcuts write the
 * same `YYYY-MM-DD` the input does, so the request body is unchanged.
 */
export function DateChoice({
	id,
	value,
	onChange,
	onBlur,
	invalid,
}: DateChoiceProps) {
	const [picked, setPicked] = useState<DateMode | null>(null)

	const mode: DateMode | null =
		picked ??
		(value === ''
			? null
			: value === isoDay(0)
				? 'today'
				: value === isoDay(1)
					? 'yesterday'
					: 'other')

	const choose = (next: DateMode) => {
		setPicked(next)
		if (next === 'today') onChange(isoDay(0))
		if (next === 'yesterday') onChange(isoDay(1))
		if (next === 'other') onChange('')
	}

	return (
		<div className="space-y-2.5">
			<div role="group" aria-label="Date" className="flex flex-wrap gap-2">
				<FilterPill active={mode === 'today'} onClick={() => choose('today')}>
					Aujourd&apos;hui
				</FilterPill>
				<FilterPill
					active={mode === 'yesterday'}
					onClick={() => choose('yesterday')}
				>
					Hier
				</FilterPill>
				<FilterPill active={mode === 'other'} onClick={() => choose('other')}>
					Autre date
				</FilterPill>
			</div>

			{mode === 'other' && (
				<Input
					id={id}
					type="date"
					value={value}
					onChange={event => onChange(event.target.value)}
					onBlur={onBlur}
					max={isoDay(0)}
					className="h-control text-base"
					aria-invalid={invalid || undefined}
				/>
			)}
		</div>
	)
}
