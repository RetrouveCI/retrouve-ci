import { Sparkles, Info, X } from 'lucide-react'
import { cn } from '@app/ui/utils'
import type { AssistantOutcome } from '@/routes/search/search.const'

/**
 * Four outcomes, four sentences. `unavailable` and `empty` read differently on
 * purpose: one is the gateway being off, out of budget or unreachable, the
 * other is the model having read the phrase and found no filter in it. Telling
 * a visitor to rephrase a sentence that was fine — or to wait out an outage
 * that never ends — is what one message for both would do.
 */
const NOTICE: Record<AssistantOutcome, string> = {
	interpreted: 'Voici ce que j’ai retenu de votre phrase.',
	empty:
		'Je n’ai pas compris votre phrase. Affinez avec les filtres ci-dessous.',
	unavailable:
		'La recherche par phrase est indisponible pour le moment. Les filtres ci-dessous fonctionnent normalement.',
	throttled:
		'Vous avez envoyé beaucoup de phrases d’affilée. Réessayez dans quelques minutes — les filtres ci-dessous restent ouverts.',
}

interface AssistantBannerProps {
	outcome: AssistantOutcome
	phrase: string
	onDismiss: () => void
}

/**
 * A banner and not a toast (§2.1): it explains why the page changed, it lives
 * in the URL, and it survives the reload a toast would not.
 */
export function AssistantBanner({
	outcome,
	phrase,
	onDismiss,
}: AssistantBannerProps) {
	const understood = outcome === 'interpreted'
	const Icon = understood ? Sparkles : Info

	return (
		<div
			role="status"
			className={cn(
				'mb-5 flex items-start gap-3 rounded-2xl border px-4 py-3',
				understood
					? 'border-primary-green/25 bg-primary-green/10 text-primary-green-text'
					: 'border-border bg-muted/50 text-foreground',
			)}
		>
			<Icon className="mt-0.5 h-4.5 w-4.5 shrink-0" aria-hidden />
			<div className="min-w-0 flex-1">
				<p className="text-sm font-semibold">{NOTICE[outcome]}</p>
				{/* The words stay on screen: they are not applied as a text search —
				    a whole sentence matches no title — so this is the only place the
				    visitor can read back, and copy, what they asked for. */}
				<p className="text-muted-foreground mt-1 text-sm break-words italic">
					«&nbsp;{phrase}&nbsp;»
				</p>
			</div>
			<button
				type="button"
				onClick={onDismiss}
				aria-label="Masquer ce message"
				className="touch-target hover:bg-foreground/5 -m-1 rounded-full p-1 transition-colors"
			>
				<X className="h-4 w-4" />
			</button>
		</div>
	)
}
