interface TipsPanelProps {
	tips: string[]
	accentColor: string
	hint: string
}

export function TipsPanel({ tips, accentColor, hint }: TipsPanelProps) {
	return (
		<div
			className="rounded-2xl border p-5"
			style={{
				borderColor: `color-mix(in srgb, ${accentColor} 15%, transparent)`,
				backgroundColor: `color-mix(in srgb, ${accentColor} 5%, transparent)`,
			}}
		>
			<p className="mb-2 text-sm font-semibold" style={{ color: accentColor }}>
				Conseils
			</p>
			<ul className="text-muted-foreground space-y-1.5 text-xs">
				{tips.map(tip => (
					<li key={tip}>{tip}</li>
				))}
			</ul>
			<p
				className="mt-3 border-t pt-3 text-xs"
				style={{
					borderColor: `color-mix(in srgb, ${accentColor} 10%, transparent)`,
					color: `color-mix(in srgb, ${accentColor} 60%, transparent)`,
				}}
			>
				{hint}
			</p>
		</div>
	)
}
