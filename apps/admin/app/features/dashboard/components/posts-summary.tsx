import { Link } from 'react-router'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@retrouve-ci/ui/components'
import { cn } from '@retrouve-ci/ui/utils'
import { ArrowRight, QrCode } from 'lucide-react'

interface Metric {
	value: number
	change: number
}

interface PostsSummaryProps {
	lost: Metric
	found: Metric
	qrGenerated: Metric
}

function ChangeChip({ change }: { change: number }) {
	const positive = change >= 0
	return (
		<span
			className={cn(
				'text-xs font-medium',
				positive ? 'text-primary' : 'text-destructive',
			)}
		>
			{positive ? '+' : ''}
			{change}%
		</span>
	)
}

function LegendRow({
	color,
	label,
	metric,
}: {
	color: string
	label: string
	metric: Metric
}) {
	return (
		<div className="flex items-center gap-3">
			<span
				className="h-2.5 w-2.5 shrink-0 rounded-full"
				style={{ backgroundColor: color }}
			/>
			<span className="text-sm font-medium">{label}</span>
			<span className="text-foreground ml-auto text-sm font-semibold tabular-nums">
				{metric.value.toLocaleString('fr-FR')}
			</span>
			<ChangeChip change={metric.change} />
		</div>
	)
}

export function PostsSummary({ lost, found, qrGenerated }: PostsSummaryProps) {
	const total = lost.value + found.value
	const lostPct = total > 0 ? (lost.value / total) * 100 : 0
	const foundPct = total > 0 ? (found.value / total) * 100 : 0

	return (
		<Card className="flex flex-col">
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<CardTitle className="text-base font-semibold">Publications</CardTitle>
				<Link
					to="/posts"
					className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs font-medium transition-colors"
				>
					Voir tout
					<ArrowRight className="h-3.5 w-3.5" />
				</Link>
			</CardHeader>
			<CardContent className="flex flex-1 flex-col gap-5">
				<div>
					<div className="flex items-end justify-between">
						<span className="text-3xl font-semibold tracking-tight tabular-nums">
							{total.toLocaleString('fr-FR')}
						</span>
						<span className="text-muted-foreground text-xs font-medium">
							Total des posts
						</span>
					</div>
					<div className="bg-muted mt-3 flex h-2.5 overflow-hidden rounded-full">
						<div
							className="bg-destructive h-full"
							style={{ width: `${lostPct}%` }}
						/>
						<div
							className="bg-primary h-full"
							style={{ width: `${foundPct}%` }}
						/>
					</div>
				</div>

				<div className="space-y-3">
					<LegendRow color="#EF4444" label="Perdus" metric={lost} />
					<LegendRow color="#1E7F43" label="Retrouvés" metric={found} />
				</div>

				<div className="mt-auto border-t pt-4">
					<div className="flex items-center gap-3">
						<div className="bg-accent/10 text-accent flex h-9 w-9 items-center justify-center rounded-lg">
							<QrCode className="h-4 w-4" />
						</div>
						<div>
							<p className="text-muted-foreground text-xs font-medium">
								QR générés
							</p>
							<p className="text-sm font-semibold tabular-nums">
								{qrGenerated.value.toLocaleString('fr-FR')}
							</p>
						</div>
						<div className="ml-auto">
							<ChangeChip change={qrGenerated.change} />
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
