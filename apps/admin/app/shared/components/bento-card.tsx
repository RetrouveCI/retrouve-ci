import { Card } from '@retrouve-ci/ui/components'
import { cn } from '@retrouve-ci/ui/utils'
import type { LucideIcon } from 'lucide-react'

interface BentoCardProps {
	title?: string
	value?: number | string
	change?: number
	icon?: LucideIcon
	iconColor?: string
	iconBgColor?: string
	className?: string
	variant?: 'stat' | 'highlight' | 'table' | 'content'
	children?: React.ReactNode
}

export function BentoCard({
	title,
	value,
	change,
	icon: Icon,
	iconColor = 'text-primary',
	iconBgColor = 'bg-primary/10',
	className,
	variant = 'stat',
	children,
}: BentoCardProps) {
	const formattedValue =
		typeof value === 'number' ? value.toLocaleString('fr-FR') : value

	if (variant === 'stat') {
		return (
			<Card
				className={cn(
					'p-5 shadow-sm transition-shadow hover:shadow-md',
					className,
				)}
			>
				<div className="flex items-start justify-between">
					<div className="space-y-2">
						<p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
							{title}
						</p>
						<p className="text-2xl font-semibold tracking-tight">
							{formattedValue}
						</p>
						{typeof change === 'number' && (
							<span
								className={cn(
									'inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium',
									change > 0
										? 'bg-green-50 text-green-700'
										: change < 0
											? 'bg-red-50 text-red-700'
											: 'bg-muted text-muted-foreground',
								)}
							>
								{change > 0 ? '+' : ''}
								{change}%
							</span>
						)}
					</div>
					{Icon && (
						<div className={cn('rounded-lg p-2', iconBgColor)}>
							<Icon className={cn('h-5 w-5', iconColor)} />
						</div>
					)}
				</div>
			</Card>
		)
	}

	if (variant === 'highlight') {
		return (
			<Card
				className={cn(
					'bg-primary text-primary-foreground p-5 shadow-sm transition-shadow hover:shadow-md',
					className,
				)}
			>
				<div className="flex items-start justify-between">
					<div className="space-y-2">
						<p className="text-primary-foreground/70 text-xs font-medium tracking-wide uppercase">
							{title}
						</p>
						<p className="text-2xl font-semibold tracking-tight">
							{formattedValue}
						</p>
						{typeof change === 'number' && (
							<span className="inline-flex items-center rounded-md bg-white/15 px-1.5 py-0.5 text-xs font-medium text-white">
								{change > 0 ? '+' : ''}
								{change}%
							</span>
						)}
					</div>
					{Icon && (
						<div className="rounded-lg bg-white/15 p-2">
							<Icon className="h-5 w-5 text-white" />
						</div>
					)}
				</div>
				{children}
			</Card>
		)
	}

	if (variant === 'table') {
		return (
			<Card className={cn('overflow-hidden shadow-sm', className)}>
				{children}
			</Card>
		)
	}

	return (
		<Card className={cn('overflow-hidden shadow-sm', className)}>
			{children}
		</Card>
	)
}
