import { cn } from '@app/ui/utils'

/**
 * The one shape a filter takes (§2.1). Exported on its own because the home
 * hero's category chips navigate instead of toggling, so they are a `Link` and
 * cannot go through the button below — but they must not be a second shape.
 */
export function filterPillClassName(active: boolean, className?: string) {
	return cn(
		'touch-target inline-flex h-chip items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium whitespace-nowrap transition-colors',
		active
			? 'bg-foreground text-background border-foreground'
			: 'bg-background border-border text-foreground hover:border-foreground/30',
		className,
	)
}

/**
 * `touch-target` widens the tap zone to 44 px without changing the 34 px drawn
 * (R33), which is also what keeps two wrapped rows from stealing each other's
 * taps.
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
			className={filterPillClassName(active, className)}
			{...props}
		/>
	)
}
