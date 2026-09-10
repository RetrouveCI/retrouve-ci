import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Skeleton,
} from '@app/ui/components'
import { cn } from '@app/ui/utils'
import { LegendDot } from './chart-legend-dot'
import type { ChartMeta } from './chart-meta'

interface ChartFallbackProps {
	meta: ChartMeta
	className?: string
}

/**
 * What stands in the chart's place until `recharts` has been fetched. It wears
 * the real card, heading and legend — those cost nothing and are server
 * rendered — and reserves the plot's exact height, so the arrival of the chart
 * shifts nothing below it.
 */
export function ChartFallback({ meta, className }: ChartFallbackProps) {
	return (
		<Card className={cn('overflow-hidden', className)}>
			<CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
				<CardTitle className="text-base font-semibold">{meta.title}</CardTitle>
				<div className="flex items-center gap-4">
					{meta.legend.map(entry => (
						<LegendDot key={entry.label} {...entry} />
					))}
				</div>
			</CardHeader>
			<CardContent className="pb-4">
				<Skeleton
					className="w-full"
					style={{ height: meta.height }}
					aria-label={`${meta.title} — chargement`}
				/>
			</CardContent>
		</Card>
	)
}
