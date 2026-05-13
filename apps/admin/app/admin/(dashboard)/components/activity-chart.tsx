import { Card, CardContent, CardHeader, CardTitle } from '@retrouve-ci/ui/components'
import { TrendingUp } from 'lucide-react'
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from 'recharts'

interface ActivityChartProps {
	data: { date: string; scans: number; activations: number }[] | undefined
}

export function ActivityChart({ data }: ActivityChartProps) {
	return (
		<Card className="overflow-hidden md:col-span-2 md:row-span-2">
			<CardHeader className="pb-2">
				<div className="flex items-center justify-between">
					<CardTitle className="text-lg font-semibold">
						Activité des 30 derniers jours
					</CardTitle>
					<div className="flex items-center gap-1 text-sm text-green-600">
						<TrendingUp className="h-4 w-4" />
						<span>+12%</span>
					</div>
				</div>
			</CardHeader>
			<CardContent className="pb-4">
				<ResponsiveContainer width="100%" height={280}>
					<AreaChart data={data}>
						<defs>
							<linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#1E7F43" stopOpacity={0.3} />
								<stop offset="95%" stopColor="#1E7F43" stopOpacity={0} />
							</linearGradient>
							<linearGradient id="colorActivations" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#F57C00" stopOpacity={0.3} />
								<stop offset="95%" stopColor="#F57C00" stopOpacity={0} />
							</linearGradient>
						</defs>
						<CartesianGrid
							strokeDasharray="3 3"
							stroke="#E5E7EB"
							vertical={false}
						/>
						<XAxis
							dataKey="date"
							tick={{ fontSize: 11 }}
							stroke="#9CA3AF"
							axisLine={false}
							tickLine={false}
						/>
						<YAxis
							tick={{ fontSize: 11 }}
							stroke="#9CA3AF"
							axisLine={false}
							tickLine={false}
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: '#fff',
								border: 'none',
								borderRadius: '12px',
								boxShadow:
									'0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
							}}
						/>
						<Area
							type="monotone"
							dataKey="scans"
							name="Scans"
							stroke="#1E7F43"
							strokeWidth={2}
							fill="url(#colorScans)"
						/>
						<Area
							type="monotone"
							dataKey="activations"
							name="Activations"
							stroke="#F57C00"
							strokeWidth={2}
							fill="url(#colorActivations)"
						/>
					</AreaChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	)
}
