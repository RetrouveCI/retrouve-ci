import { Card } from '@retrouve-ci/ui/components'
import { cn } from '@retrouve-ci/ui/utils'
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react'

interface StatCardProps {
	title: string
	value: number | string
	change?: number
	icon: LucideIcon
	accent?: 'primary' | 'accent'
}

export function StatCard({
	title,
	value,
	change,
	icon: Icon,
	accent = 'primary',
}: StatCardProps) {
	const formatted =
		typeof value === 'number' ? value.toLocaleString('fr-FR') : value
	const hasChange = typeof change === 'number'
	const positive = hasChange && change >= 0

	return (
		<Card className="p-5 transition-shadow hover:shadow-md">
			<div className="flex items-center justify-between">
				<div
					className={cn(
						'flex h-10 w-10 items-center justify-center rounded-xl',
						accent === 'accent'
							? 'bg-accent/10 text-accent'
							: 'bg-primary/10 text-primary',
					)}
				>
					<Icon className="h-5 w-5" />
				</div>
				{hasChange && (
					<span
						className={cn(
							'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium',
							positive
								? 'bg-primary/10 text-primary'
								: 'bg-destructive/10 text-destructive',
						)}
					>
						{positive ? (
							<ArrowUpRight className="h-3 w-3" />
						) : (
							<ArrowDownRight className="h-3 w-3" />
						)}
						{Math.abs(change)}%
					</span>
				)}
			</div>
			<p className="text-muted-foreground mt-4 text-sm font-medium">{title}</p>
			<p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">
				{formatted}
			</p>
		</Card>
	)
}
