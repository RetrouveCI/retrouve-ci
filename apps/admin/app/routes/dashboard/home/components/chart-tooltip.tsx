interface ChartTooltipProps {
	active?: boolean
	label?: string | number
	payload?: Array<{
		dataKey?: string | number
		name?: string
		value?: number
		color?: string
	}>
}

/**
 * Theme-aware tooltip for the recharts dashboards. Uses popover tokens so it
 * reads correctly in both light and dark mode (the recharts default tooltip
 * is hardcoded white).
 */
export function ChartTooltip({ active, label, payload }: ChartTooltipProps) {
	if (!active || !payload?.length) return null

	return (
		<div className="bg-popover text-popover-foreground min-w-32 rounded-lg border px-3 py-2 shadow-md">
			{label !== undefined && (
				<p className="mb-1.5 text-xs font-medium">{label}</p>
			)}
			<div className="space-y-1">
				{payload.map(entry => (
					<div key={entry.dataKey} className="flex items-center gap-2 text-xs">
						<span
							className="h-2 w-2 shrink-0 rounded-full"
							style={{ backgroundColor: entry.color }}
						/>
						<span className="text-muted-foreground">{entry.name}</span>
						<span className="ml-auto font-semibold tabular-nums">
							{entry.value?.toLocaleString('fr-FR')}
						</span>
					</div>
				))}
			</div>
		</div>
	)
}
