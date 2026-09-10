interface LegendDotProps {
	color: string
	label: string
}

export function LegendDot({ color, label }: LegendDotProps) {
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
