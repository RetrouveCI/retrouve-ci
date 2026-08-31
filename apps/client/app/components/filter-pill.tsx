import { cn } from '@app/ui/utils'

/**
 * The one shape a filter takes (§2.1) — on « Annonces », in its sheet and on
 * « Mes annonces » alike. `touch-target` widens the tap zone to 44 px without
 * changing the 38 px drawn, which is also what keeps two wrapped rows from
 * stealing each other's taps: 3 px of overhang inside an 8 px gap.
 */
export function FilterPill({
	active,
	className,
	...props
}: React.ComponentProps<'button'> & { active: boolean }) {
	return (
		<button
			type="button"
			aria-pressed={active}
			className={cn(
				'touch-target inline-flex h-9.5 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-medium whitespace-nowrap transition-colors',
				active
					? 'bg-foreground text-background border-foreground'
					: 'bg-background border-border text-foreground hover:border-foreground/30',
				className,
			)}
			{...props}
		/>
	)
}
