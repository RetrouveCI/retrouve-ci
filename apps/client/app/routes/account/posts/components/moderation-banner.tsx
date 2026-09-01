import { Clock } from 'lucide-react'
import type { ModerationNotice } from '../helpers/moderation-notice'

/**
 * Moderation is an exception that calls for an explanation, not a bucket to
 * browse (§2.1), so it is stated once above the list rather than filtered.
 *
 * The colours are named in both themes: a fixed light surface with a fixed dark
 * ink is the rule R3 set for a notice, and it is the same pair the edit screen
 * uses for the same subject.
 */
export function ModerationBanner({ title, detail }: ModerationNotice) {
	return (
		<div
			role="status"
			className="flex gap-3 rounded-2xl border border-yellow-500/30 bg-yellow-50 p-3.5 text-yellow-900 dark:border-yellow-500/25 dark:bg-yellow-950/40 dark:text-yellow-100"
		>
			<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-yellow-200/70 dark:bg-yellow-900/60">
				<Clock className="h-4.5 w-4.5" />
			</div>
			<div className="min-w-0">
				<p className="text-sm font-semibold">{title}</p>
				<p className="mt-0.5 text-xs opacity-80">{detail}</p>
			</div>
		</div>
	)
}
