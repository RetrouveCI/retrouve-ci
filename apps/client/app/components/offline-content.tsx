import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Package, RefreshCw, WifiOff } from 'lucide-react'
import { Badge } from '@app/ui/components'
import { listingsAvailableOffline } from '@/shared/helpers/offline-cache'
import type { ViewedListing } from '@/shared/helpers/viewed-listings'
import { readPublishDraft } from '@/routes/publish/helpers/publish-draft'
import { STEP_COUNT } from '@/routes/publish/hooks/use-publish-steps'

interface OfflineContentProps {
	/** Where « Réessayer » goes; already sanitised by the caller. */
	retryTo: string
}

/**
 * Shared by the `/offline` route and the root error boundary: a client-side
 * navigation whose loader cannot reach the network never gets as far as the
 * worker's redirect, so the same page has to be reachable from a thrown error.
 */
export function OfflineContent({ retryTo }: OfflineContentProps) {
	const [available, setAvailable] = useState<ViewedListing[] | null>(null)
	const [hasDraft, setHasDraft] = useState(false)

	useEffect(() => {
		let live = true

		void listingsAvailableOffline().then(listings => {
			if (live) setAvailable(listings)
		})

		setHasDraft(readPublishDraft(STEP_COUNT) !== null)

		return () => {
			live = false
		}
	}, [])

	return (
		<main className="mx-auto flex w-full max-w-2xl flex-col">
			<div className="flex flex-col items-center gap-3 px-5 pt-7 pb-5 text-center">
				<div className="bg-muted text-muted-foreground flex h-16 w-16 items-center justify-center rounded-full">
					<WifiOff className="h-7 w-7" />
				</div>
				<h1 className="text-2xl font-bold tracking-tight">
					Pas de réseau pour l&apos;instant
				</h1>
				<p className="text-muted-foreground max-w-72 text-sm">
					Voici ce que vous aviez déjà consulté. Tout se remettra à jour dès le
					retour du réseau.
				</p>
				<button
					type="button"
					onClick={() => window.location.assign(retryTo)}
					className="border-border text-foreground hover:bg-muted h-control mt-1 flex w-full items-center justify-center gap-2.5 rounded-[14px] border-[1.5px] text-lg font-semibold transition-colors"
				>
					<RefreshCw className="h-4.5 w-4.5" />
					Réessayer
				</button>
			</div>

			<section className="flex flex-col gap-3 px-4 pb-5">
				<div className="flex items-center gap-2">
					<h2 className="text-xl font-bold tracking-tight">
						Disponible hors connexion
					</h2>
					<Badge className="bg-muted text-muted-foreground h-5.5 text-xs font-bold tracking-[0.04em] uppercase">
						En cache
					</Badge>
				</div>

				{available !== null && available.length === 0 && (
					<p className="text-muted-foreground text-sm">
						Aucune annonce n&apos;a encore été consultée sur cet appareil.
					</p>
				)}

				{available?.map(listing => (
					<Link
						key={listing.id}
						to={`/posts/${listing.id}`}
						className="border-border hover:bg-muted/50 flex items-center gap-3 rounded-[14px] border p-3 transition-colors"
					>
						<div className="bg-muted text-muted-foreground flex h-19 w-19 shrink-0 items-center justify-center rounded-xl">
							<Package className="h-6 w-6" />
						</div>
						<div className="min-w-0 flex-1">
							<p className="truncate font-semibold">{listing.title}</p>
							{listing.location !== '' && (
								<p className="text-muted-foreground mt-0.5 truncate text-xs">
									{listing.location}
								</p>
							)}
						</div>
					</Link>
				))}
			</section>

			{hasDraft && (
				<div className="px-4 pb-6">
					<div className="flex gap-3 rounded-2xl border border-yellow-500/30 bg-yellow-50 p-3.5 text-yellow-900 dark:border-yellow-500/25 dark:bg-yellow-950/40 dark:text-yellow-100">
						<Package className="mt-0.5 h-4.5 w-4.5 shrink-0" />
						{/* Not « il partira au retour du réseau » : the draft holds the
						    eight text fields and no photo, so nothing may post itself.
						    See § R24 of the plan. */}
						<p className="text-sm">
							Votre brouillon d&apos;annonce est conservé. Vous pourrez le
							publier dès le retour du réseau.
						</p>
					</div>
				</div>
			)}
		</main>
	)
}
