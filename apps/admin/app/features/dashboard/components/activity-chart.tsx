import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@retrouve-ci/ui/components'
import { cn } from '@retrouve-ci/ui/utils'
import { useTheme } from '@/shared/components/theme-context'
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

const SCANS_COLOR = '#1E7F43'
const ACTIVATIONS_COLOR = '#F57C00'

interface ActivityChartProps {
	data: { date: string; scans: number; activations: number }[] | undefined
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

export function ActivityChart({ data, className }: ActivityChartProps) {
	const { theme } = useTheme()
	const isDark = theme === 'dark'
	const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
	const axisColor = isDark ? '#71717a' : '#9ca3af'

	return (
		<Card className={cn('overflow-hidden', className)}>
			<CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
				<CardTitle className="text-base font-semibold">
					Activité des 30 derniers jours
				</CardTitle>
				<div className="flex items-center gap-4">
					<LegendDot color={SCANS_COLOR} label="Scans" />
					<LegendDot color={ACTIVATIONS_COLOR} label="Activations" />
				</div>
			</CardHeader>
			<CardContent className="pb-4">
				<ResponsiveContainer width="100%" height={300}>
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
