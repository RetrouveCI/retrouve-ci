import { cn } from '@app/ui/utils'

/**
 * The one shape a filter takes on this page (§2.1) — in the sheet and on the
 * page alike. `touch-target` widens the tap zone to 44 px without changing what
 * is drawn, so the capsule keeps the 34–38 px the vocabulary asks for.
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
