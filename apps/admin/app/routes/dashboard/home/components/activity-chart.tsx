import { Card, CardContent, CardHeader, CardTitle } from '@app/ui/components'
import { cn } from '@app/ui/utils'
import { useTheme } from '@/context/theme'
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from 'recharts'
import { ChartTooltip } from './chart-tooltip'
import { LegendDot } from './chart-legend-dot'
import { ACTIVATIONS_COLOR, ACTIVITY_CHART, SCANS_COLOR } from './chart-meta'

interface ActivityChartProps {
	data: { date: string; scans: number; activations: number }[] | undefined
	className?: string
}

export function ActivityChart({ data, className }: ActivityChartProps) {
	const { theme } = useTheme()
	const isDark = theme === 'dark'
	const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
	const axisColor = isDark ? '#71717a' : '#9ca3af'

	return (
		<Card className={cn('overflow-hidden', className)}>
			<CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
				<CardTitle className="text-base font-semibold">
					{ACTIVITY_CHART.title}
				</CardTitle>
				<div className="flex items-center gap-4">
					{ACTIVITY_CHART.legend.map(entry => (
						<LegendDot key={entry.label} {...entry} />
					))}
				</div>
			</CardHeader>
			<CardContent className="pb-4">
				<ResponsiveContainer width="100%" height={ACTIVITY_CHART.height}>
					<AreaChart
						data={data}
						margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
					>
						<defs>
							<linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor={SCANS_COLOR} stopOpacity={0.25} />
								<stop offset="95%" stopColor={SCANS_COLOR} stopOpacity={0} />
							</linearGradient>
							<linearGradient id="colorActivations" x1="0" y1="0" x2="0" y2="1">
								<stop
									offset="5%"
									stopColor={ACTIVATIONS_COLOR}
									stopOpacity={0.25}
								/>
								<stop
									offset="95%"
									stopColor={ACTIVATIONS_COLOR}
									stopOpacity={0}
								/>
							</linearGradient>
						</defs>
						<CartesianGrid
							strokeDasharray="3 3"
							stroke={gridColor}
							vertical={false}
						/>
						<XAxis
							dataKey="date"
							tick={{ fontSize: 11, fill: axisColor }}
							stroke={gridColor}
							axisLine={false}
							tickLine={false}
							minTickGap={24}
						/>
						<YAxis
							tick={{ fontSize: 11, fill: axisColor }}
							stroke={gridColor}
							axisLine={false}
							tickLine={false}
							width={48}
						/>
						<Tooltip
							content={<ChartTooltip />}
							cursor={{ stroke: axisColor, strokeDasharray: '4 4' }}
						/>
						<Area
							type="monotone"
							dataKey="scans"
							name="Scans"
							stroke={SCANS_COLOR}
							strokeWidth={2}
							fill="url(#colorScans)"
						/>
						<Area
							type="monotone"
							dataKey="activations"
							name="Activations"
							stroke={ACTIVATIONS_COLOR}
							strokeWidth={2}
							fill="url(#colorActivations)"
						/>
					</AreaChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	)
}
