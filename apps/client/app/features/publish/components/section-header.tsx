import type { LucideIcon } from 'lucide-react'

interface SectionHeaderProps {
	step?: number
	icon: LucideIcon
	title: string
	description?: string
	accentColor: string
}

export function SectionHeader({
	step,
	icon: Icon,
	title,
	description,
	accentColor,
}: SectionHeaderProps) {
	return (
		<div className="flex items-center gap-3">
			<div
				className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
				style={{
					backgroundColor: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
				}}
			>
				<Icon className="h-5 w-5" style={{ color: accentColor }} />
				{step !== undefined && (
					<span
						className="bg-background absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold"
						style={{
							color: accentColor,
							boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${accentColor} 30%, transparent)`,
						}}
					>
						{step}
					</span>
				)}
			</div>
			<div>
				<h2 className="leading-tight font-bold">{title}</h2>
				{description && (
					<p className="text-muted-foreground text-sm">{description}</p>
				)}
			</div>
		</div>
	)
}
