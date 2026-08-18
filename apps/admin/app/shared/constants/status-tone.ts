/**
 * Shared, theme-safe colour classes for status badges. Opacity-based tints
 * with dark-mode text variants so a single tone reads correctly in both
 * light and dark, replacing the old `bg-*-50 text-*-700` (light-only) configs
 * scattered across the list pages.
 */
export type StatusTone =
	| 'primary'
	| 'success'
	| 'warning'
	| 'danger'
	| 'info'
	| 'purple'
	| 'neutral'

export const STATUS_TONE_CLASSES: Record<StatusTone, string> = {
	primary: 'bg-primary/10 text-primary',
	success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
	warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
	danger: 'bg-red-500/10 text-red-600 dark:text-red-400',
	info: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
	purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
	neutral: 'bg-muted text-muted-foreground',
}
