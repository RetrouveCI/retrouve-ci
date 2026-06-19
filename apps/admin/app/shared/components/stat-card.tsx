import { Card } from '@retrouve-ci/ui/components'
import { cn } from '@retrouve-ci/ui/utils'
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react'

export type StatTone =
	| 'primary'
	| 'accent'
	| 'success'
	| 'warning'
	| 'danger'
	| 'info'
	| 'purple'
	| 'neutral'

// Opacity-based tints so every tone reads correctly on light and dark surfaces.
const TONE_STYLES: Record<StatTone, string> = {
	primary: 'bg-primary/10 text-primary',
	accent: 'bg-accent/10 text-accent',
	success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
	warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
	danger: 'bg-red-500/10 text-red-600 dark:text-red-400',
	info: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
	purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
	neutral: 'bg-muted text-muted-foreground',
}

interface StatCardProps {
	title: string
	value: number | string
	change?: number
	icon: LucideIcon
	/** Icon tint for the default card; ignored when `highlight` is set. */
	tone?: StatTone
	/** Solid brand-green emphasis card, for headline totals. */
	highlight?: boolean
	className?: string
}

function ChangeChip({ change, onDark }: { change: number; onDark?: boolean }) {
	const positive = change >= 0
	const Icon = positive ? ArrowUpRight : ArrowDownRight
	return (
		<span
			className={cn(
				'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium',
				onDark
					? 'bg-white/15 text-white'
					: positive
						? 'bg-primary/10 text-primary'
						: 'bg-destructive/10 text-destructive',
			)}
		>
			<Icon className="h-3 w-3" />
			{Math.abs(change)}%
		</span>
	)
}

export function StatCard({
	title,
	value,
	change,
	icon: Icon,
	tone = 'primary',
	highlight = false,
	className,
}: StatCardProps) {
	const formatted =
		typeof value === 'number' ? value.toLocaleString('fr-FR') : value
	const hasChange = typeof change === 'number'

	return (
		<Card
			className={cn(
				'p-5 transition-shadow hover:shadow-md',
				highlight && 'bg-primary text-primary-foreground',
				className,
			)}
		>
			<div className="flex items-center justify-between">
				<div
					className={cn(
						'flex h-10 w-10 items-center justify-center rounded-xl',
						highlight ? 'bg-white/15 text-white' : TONE_STYLES[tone],
					)}
				>
					<Icon className="h-5 w-5" />
				</div>
				{hasChange && <ChangeChip change={change} onDark={highlight} />}
			</div>
			<p
				className={cn(
					'mt-4 text-sm font-medium',
					highlight ? 'text-primary-foreground/70' : 'text-muted-foreground',
				)}
			>
				{title}
			</p>
			<p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">
				{formatted}
			</p>
		</Card>
	)
}
