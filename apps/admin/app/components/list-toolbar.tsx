import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router'
import { Search } from 'lucide-react'
import { Input } from '@app/ui/components'
import { cn } from '@app/ui/utils'
import { formatNumber, LIST_SEARCH_MAX_LENGTH } from '@app/contracts/shared'

export interface ListChip {
	value: string
	label: string
	/** Absent when the count could not be read: no zero nobody measured. */
	count?: number
}

interface ListToolbarProps {
	/** The query-string key the chips write. */
	param?: string
	chips?: ListChip[]
	/** When set, a search box writes `q`, which the loader sends to the API. */
	searchPlaceholder?: string
	children?: React.ReactNode
}

/**
 * One line for every list: search, the filters with their counts, then the
 * page's own tools. Everything it sets goes into the URL — a view is shared by
 * its link — and a new filter always returns to the first page.
 */
export function ListToolbar({
	param = 'status',
	chips = [],
	searchPlaceholder,
	children,
}: ListToolbarProps) {
	const [searchParams, setSearchParams] = useSearchParams()
	const active = searchParams.get(param) ?? 'all'

	const select = (value: string) => {
		const next = new URLSearchParams(searchParams)

		if (value === 'all') next.delete(param)
		else next.set(param, value)
		next.delete('page')

		setSearchParams(next)
	}

	return (
		<div className="flex flex-wrap items-center gap-2 border-b p-3">
			{searchPlaceholder && (
				// Keyed on the URL's search, so going back restores the box too.
				<SearchBox
					key={searchParams.get('q') ?? ''}
					placeholder={searchPlaceholder}
				/>
			)}

			{chips.length > 0 && (
				<div
					role="group"
					aria-label="Filtrer"
					className="flex flex-wrap gap-1.5"
				>
					{chips.map(chip => {
						const on = active === chip.value

						return (
							<button
								key={chip.value}
								type="button"
								aria-pressed={on}
								onClick={() => select(chip.value)}
								className={cn(
									'bg-card text-muted-foreground hover:bg-muted hover:text-foreground inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors',
									on &&
										'border-primary bg-primary/10 text-primary-green-text hover:bg-primary/10 hover:text-primary-green-text font-semibold',
								)}
							>
								{chip.label}
								{chip.count !== undefined && (
									<span className="font-mono opacity-80">
										{formatNumber(chip.count)}
									</span>
								)}
							</button>
						)
					})}
				</div>
			)}

			{children && (
				<div className="ml-auto flex flex-wrap items-center gap-2">
					{children}
				</div>
			)}
		</div>
	)
}

function SearchBox({ placeholder }: { placeholder: string }) {
	const [searchParams, setSearchParams] = useSearchParams()
	const [value, setValue] = useState(searchParams.get('q') ?? '')

	const submit = (event: FormEvent) => {
		event.preventDefault()

		const next = new URLSearchParams(searchParams)
		const search = value.trim()

		if (search) next.set('q', search)
		else next.delete('q')
		next.delete('page')

		setSearchParams(next)
	}

	return (
		<form
			role="search"
			onSubmit={submit}
			className="relative min-w-48 flex-1 sm:max-w-xs"
		>
			<Search className="text-muted-foreground/70 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
			<Input
				type="search"
				aria-label="Rechercher"
				placeholder={placeholder}
				value={value}
				maxLength={LIST_SEARCH_MAX_LENGTH}
				onChange={event => setValue(event.target.value)}
				className="h-8 pl-9"
			/>
		</form>
	)
}
