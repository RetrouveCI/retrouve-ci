import { Link } from 'react-router'
import { cn } from '@app/ui/utils'
import type { ActivitySummary as Summary } from '@/shared/types/activity'

/**
 * What the floating activity bubble used to say, said in place. R6 removed the
 * bubble: a panel that followed the visitor across every screen to describe one
 * screen was the wrong shape, and it sat on top of the tab bar it now makes room
 * for.
 *
 * Three numbers, each a way in — the panel's rows were links too, and that is
 * the part worth keeping.
 */
export function ActivitySummary({ summary }: { summary: Summary | null }) {
	if (!summary) return null

	const tiles = [
		{
			href: '/notifications',
			value: summary.unreadNotifications,
			label:
				summary.unreadNotifications > 1 ? 'alertes non lues' : 'alerte non lue',
			// Only what needs an answer is coloured; a quiet account stays quiet.
			highlight: summary.unreadNotifications > 0,
		},
		{
			href: '/account/posts',
			value: summary.posts.active,
			label:
				summary.posts.active > 1 ? 'annonces en ligne' : 'annonce en ligne',
			highlight: false,
		},
		{
			href: '/account/orders',
			value: summary.orders.inProgress,
			label:
				summary.orders.inProgress > 1
					? 'commandes en cours'
					: 'commande en cours',
			highlight: false,
		},
	]

	return (
		<section className="pt-8">
			<div className="container mx-auto px-4">
				<h2 className="mb-3 text-sm font-semibold">Votre activité</h2>
				<div className="grid grid-cols-3 gap-2.5">
					{tiles.map(({ href, value, label, highlight }) => (
						<Link
							key={href}
							to={href}
							className={cn(
								'flex flex-col gap-1 rounded-2xl border p-3.5 transition-colors',
								highlight
									? 'border-primary-green/30 bg-primary-green/10'
									: 'bg-background hover:border-foreground/20',
							)}
						>
							<span
								className={cn(
									'text-2xl font-bold tabular-nums',
									highlight && 'text-primary-green-text',
								)}
							>
								{value}
							</span>
							<span
								className={cn(
									'text-xs leading-snug',
									highlight
										? 'text-primary-green-text'
										: 'text-muted-foreground',
								)}
							>
								{label}
							</span>
						</Link>
					))}
				</div>
			</div>
		</section>
	)
}
