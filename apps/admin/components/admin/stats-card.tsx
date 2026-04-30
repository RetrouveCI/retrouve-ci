import { Card } from '@repo/ui/components/ui/card'
import { cn } from '@repo/ui/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
	title: string
	value: number | string
	change: number
	icon: LucideIcon
	iconColor?: string
	iconBgColor?: string
}

export function StatsCard({
	title,
	value,
	change,
	icon: Icon,
	iconColor = 'text-primary',
	iconBgColor = 'bg-primary/10',
}: StatsCardProps) {
	const formattedValue =
		typeof value === 'number' ? value.toLocaleString('fr-FR') : value

	return (
		<Card className="p-6">
			<div className="flex items-start justify-between">
				<div className="space-y-2">
					<p className="text-muted-foreground text-sm font-medium">{title}</p>
					<h3 className="text-3xl font-bold">{formattedValue}</h3>
					<p
						className={cn(
							'text-sm',
							change > 0
								? 'text-green-600'
								: change < 0
									? 'text-red-600'
									: 'text-muted-foreground',
						)}
					>
						{change > 0 ? '+' : ''}
						{change}% depuis la semaine dernière
					</p>
				</div>
				<div className={cn('rounded-lg p-3', iconBgColor)}>
					<Icon className={cn('h-6 w-6', iconColor)} />
				</div>
			</div>
		</Card>
	)
}
