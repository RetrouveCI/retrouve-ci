import { CheckCircle2 } from 'lucide-react'
import { cn } from '@retrouve-ci/ui/utils'

interface ProgressItem {
	label: string
	done: boolean
}

interface FormProgressProps {
	progress: number
	items: ProgressItem[]
	accentColor: string
}

export function FormProgress({
	progress,
	items,
	accentColor,
}: FormProgressProps) {
	return (
		<div className="bg-background rounded-2xl border p-5">
			<div className="mb-3 flex items-center justify-between">
				<p className="text-sm font-semibold">Complétion</p>
				<span className="text-sm font-bold" style={{ color: accentColor }}>
					{progress}%
				</span>
			</div>
			<div className="bg-muted h-2 overflow-hidden rounded-full">
				<div
					className="h-full rounded-full transition-all duration-500"
					style={{ width: `${progress}%`, backgroundColor: accentColor }}
				/>
			</div>
			<ul className="mt-4 space-y-2">
				{items.map(({ label, done }) => (
					<li key={label} className="flex items-center gap-2 text-sm">
						<CheckCircle2
							className={cn(
								'h-4 w-4 shrink-0',
								done ? '' : 'text-muted-foreground/30',
							)}
							style={done ? { color: accentColor } : undefined}
						/>
						<span
							className={done ? 'text-foreground' : 'text-muted-foreground'}
						>
							{label}
						</span>
					</li>
				))}
			</ul>
		</div>
	)
}
