import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@retrouve-ci/ui/components'
import { cn } from '@retrouve-ci/ui/utils'
import { useTheme } from '@/shared/components/theme-context'
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from 'recharts'
import { ChartTooltip } from './chart-tooltip'

const LOST_COLOR = '#EF4444'
const FOUND_COLOR = '#1E7F43'

interface CategoryChartProps {
	data: { category: string; lost: number; found: number }[] | undefined
	className?: string
}

function LegendDot({ color, label }: { color: string; label: string }) {
	return (
		<span className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
			<span
				className="h-2.5 w-2.5 rounded-full"
				style={{ backgroundColor: color }}
			/>
			{label}
		</span>
	)
}

export function CategoryChart({ data, className }: CategoryChartProps) {
	const { theme } = useTheme()
	const isDark = theme === 'dark'
	const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
	const axisColor = isDark ? '#71717a' : '#9ca3af'

	return (
		<Card className={cn('overflow-hidden', className)}>
			<CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
				<CardTitle className="text-base font-semibold">
					Posts par catégorie
				</CardTitle>
				<div className="flex items-center gap-4">
					<LegendDot color={LOST_COLOR} label="Perdus" />
					<LegendDot color={FOUND_COLOR} label="Retrouvés" />
				</div>
			</CardHeader>
			<CardContent className="pb-4">
				<ResponsiveContainer width="100%" height={260}>
					<BarChart
						data={data}
						barGap={6}
						margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
					>
						<CartesianGrid
							strokeDasharray="3 3"
							stroke={gridColor}
							vertical={false}
						/>
						<XAxis
							dataKey="category"
							tick={{ fontSize: 11, fill: axisColor }}
							stroke={gridColor}
							axisLine={false}
							tickLine={false}
							interval={0}
							angle={-25}
							textAnchor="end"
							height={56}
						/>
						<YAxis
							tick={{ fontSize: 11, fill: axisColor }}
							stroke={gridColor}
							axisLine={false}
							tickLine={false}
							width={40}
						/>
						<Tooltip content={<ChartTooltip />} cursor={{ fill: gridColor }} />
						<Bar
							dataKey="lost"
							name="Perdus"
							fill={LOST_COLOR}
							radius={[4, 4, 0, 0]}
							maxBarSize={28}
						/>
						<Bar
							dataKey="found"
							name="Retrouvés"
							fill={FOUND_COLOR}
							radius={[4, 4, 0, 0]}
							maxBarSize={28}
						/>
					</BarChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	)
}
