import { Link } from 'react-router'
import { UserPen } from 'lucide-react'

/**
 * Accounts older than A4 are named after their own phone number, and this is
 * where that number is on screen — so this is where it is worth fixing.
 */
export function NameReminder() {
	return (
		<section className="pt-8">
			<div className="container mx-auto px-4">
				<div className="border-accent-orange/30 bg-accent-orange/10 flex flex-wrap items-center gap-3 rounded-2xl border p-4">
					<UserPen className="text-accent-orange-text h-5 w-5 shrink-0" />
					<p className="min-w-40 flex-1 text-sm">
						Votre compte s’affiche avec votre numéro. Un nom rassure la personne
						qui trouve votre objet, et vos annonces le reprennent.
					</p>
					<Link
						to="/account/settings"
						className="border-accent-orange/40 text-accent-orange-text hover:bg-accent-orange/15 h-control inline-flex shrink-0 items-center rounded-xl border px-4 text-sm font-semibold transition-colors"
					>
						Renseigner mon nom
					</Link>
				</div>
			</div>
		</section>
	)
}
