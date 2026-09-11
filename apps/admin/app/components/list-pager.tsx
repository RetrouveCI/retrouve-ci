import { Link, useSearchParams } from 'react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@app/ui/components'
import { cn } from '@app/ui/utils'
import { formatNumber } from '@app/contracts/shared'
import {
	DEFAULT_PAGE_SIZE,
	PAGE_SIZES,
	pageWindow,
} from '@/shared/helpers/list-params'

interface ListPagerProps {
	page: number
	pageSize: number
	total: number
}

const PAGE_LINK =
	'flex h-7 min-w-7 items-center justify-center rounded-md border px-1.5 font-mono text-xs transition-colors'

/** The page lives in the URL, so every button is a link a colleague can open. */
export function ListPager({ page, pageSize, total }: ListPagerProps) {
	const [searchParams, setSearchParams] = useSearchParams()
	const last = Math.max(1, Math.ceil(total / pageSize))
	const from = total === 0 ? 0 : (page - 1) * pageSize + 1
	const to = Math.min(total, page * pageSize)

	const hrefFor = (target: number) => {
		const next = new URLSearchParams(searchParams)

		if (target > 1) next.set('page', String(target))
		else next.delete('page')

		return `?${next.toString()}`
	}

	const setPageSize = (value: string) => {
		const next = new URLSearchParams(searchParams)

		if (Number(value) === DEFAULT_PAGE_SIZE) next.delete('pageSize')
		else next.set('pageSize', value)
		next.delete('page')

		setSearchParams(next)
	}

	return (
		<div className="text-muted-foreground flex flex-wrap items-center gap-3 border-t px-3 py-2 text-sm">
			<span>Lignes par page</span>
			<Select value={String(pageSize)} onValueChange={setPageSize}>
				<SelectTrigger aria-label="Lignes par page" className="h-8 w-18">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{PAGE_SIZES.map(size => (
						<SelectItem key={size} value={String(size)}>
							{size}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<span className="font-mono">
				{formatNumber(from)}–{formatNumber(to)} sur {formatNumber(total)}
			</span>

			<nav aria-label="Pagination" className="ml-auto flex items-center gap-1">
				<PageStep
					to={hrefFor(page - 1)}
					disabled={page <= 1}
					label="Page précédente"
				>
					<ChevronLeft className="h-3.5 w-3.5" />
				</PageStep>
				{pageWindow(page, last).map((target, index) =>
					target === 'gap' ? (
						<span key={`gap-${index}`} aria-hidden className="px-1">
							…
						</span>
					) : (
						<Link
							key={target}
							to={hrefFor(target)}
							aria-label={`Page ${target}`}
							aria-current={target === page ? 'page' : undefined}
							className={cn(
								PAGE_LINK,
								target === page
									? 'bg-primary border-primary text-primary-foreground font-semibold'
									: 'bg-card hover:bg-muted',
							)}
						>
							{target}
						</Link>
					),
				)}
				<PageStep
					to={hrefFor(page + 1)}
					disabled={page >= last}
					label="Page suivante"
				>
					<ChevronRight className="h-3.5 w-3.5" />
				</PageStep>
			</nav>
		</div>
	)
}

function PageStep({
	to,
	disabled,
	label,
	children,
}: {
	to: string
	disabled: boolean
	label: string
	children: React.ReactNode
}) {
	if (disabled) {
		return (
			<span aria-disabled className={cn(PAGE_LINK, 'bg-card opacity-40')}>
				<span className="sr-only">{label}</span>
				{children}
			</span>
		)
	}

	return (
		<Link
			to={to}
			aria-label={label}
			className={cn(PAGE_LINK, 'bg-card hover:bg-muted')}
		>
			{children}
		</Link>
	)
}
