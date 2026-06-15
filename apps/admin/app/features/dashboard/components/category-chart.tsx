import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@retrouve-ci/ui/components'
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from 'recharts'

interface CategoryChartProps {
	data: { category: string; lost: number; found: number }[] | undefined
}

export function CategoryChart({ data }: CategoryChartProps) {
	return (
		<Card className="overflow-hidden md:col-span-2">
			<CardHeader className="pb-2">
				<CardTitle className="text-lg font-semibold">
					Posts par catégorie
				</CardTitle>
			</CardHeader>
			<CardContent className="pb-4">
				<ResponsiveContainer width="100%" height={180}>
					<BarChart data={data} barGap={8}>
						<CartesianGrid
							strokeDasharray="3 3"
							stroke="#E5E7EB"
							vertical={false}
						/>
						<XAxis
							dataKey="category"
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
								boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
							}}
						/>
						<Bar
							dataKey="lost"
							name="Perdus"
							fill="#EF4444"
							radius={[6, 6, 0, 0]}
						/>
						<Bar
							dataKey="found"
							name="Retrouvés"
							fill="#1E7F43"
							radius={[6, 6, 0, 0]}
						/>
					</BarChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	)
}
