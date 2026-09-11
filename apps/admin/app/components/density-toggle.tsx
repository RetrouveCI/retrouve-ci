import { Rows2, Rows3, Rows4, type LucideIcon } from 'lucide-react'
import { cn } from '@app/ui/utils'
import { useTableDensity } from '@/context/table-density'
import type { TableDensity } from '@/shared/helpers/table-density'

const OPTIONS: { density: TableDensity; label: string; icon: LucideIcon }[] = [
	{ density: 'compacte', label: 'Densité compacte', icon: Rows4 },
	{ density: 'normale', label: 'Densité normale', icon: Rows3 },
	{ density: 'confortable', label: 'Densité confortable', icon: Rows2 },
]

export function DensityToggle() {
	const { density, setDensity } = useTableDensity()

	return (
		<div
			role="group"
			aria-label="Densité des lignes"
			className="bg-muted/60 flex gap-0.5 rounded-md border p-0.5"
		>
			{OPTIONS.map(({ density: value, label, icon: Icon }) => (
				<button
					key={value}
					type="button"
					title={label}
					aria-label={label}
					aria-pressed={density === value}
					onClick={() => setDensity(value)}
					className={cn(
						'text-muted-foreground hover:text-foreground flex h-7 w-7 items-center justify-center rounded transition-colors',
						density === value && 'bg-card text-foreground shadow-xs',
					)}
				>
					<Icon className="h-3.5 w-3.5" />
				</button>
			))}
		</div>
	)
}
