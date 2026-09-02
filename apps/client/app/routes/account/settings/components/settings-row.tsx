import { ChevronRight } from 'lucide-react'
import { cn } from '@app/ui/utils'

interface SettingsRowProps extends Omit<
	React.ComponentProps<'button'>,
	'value'
> {
	label: string
	/** Absent when there is nothing to show, as on the password row. */
	value?: string | null
	last?: boolean
}

/**
 * The whole line is the target, not a « Modifier » button beside it: four
 * dialogs used to hang off four 32 px buttons on a screen whose rows are 52 px
 * tall.
 */
export function SettingsRow({
	label,
	value,
	last,
	className,
	...props
}: SettingsRowProps) {
	return (
		<button
			type="button"
			className={cn(
				'touch-target hover:bg-muted/50 flex min-h-13 w-full items-center gap-3.5 px-1 text-left transition-colors',
				!last && 'border-b',
				className,
			)}
			{...props}
		>
			<span className="flex-1 text-lg font-medium">{label}</span>
			{value && (
				<span className="text-muted-foreground truncate text-sm">{value}</span>
			)}
			<ChevronRight className="text-muted-foreground/50 h-4.5 w-4.5 shrink-0" />
		</button>
	)
}
