import { Button } from '@app/ui/components'
import { Link } from 'react-router'
import { useState } from 'react'
import { ArrowLeft, QrCode, ScanLine, TriangleAlert } from 'lucide-react'
import { FilterPill } from '@/components/filter-pill'
import { pageMeta } from '@/shared/helpers/page-meta'
import { ActivationProgress } from './components/activation-progress'
import { ActivateStickerDialog } from './components/activate-sticker-dialog'
import { OrderMoreCta } from './components/order-more-cta'
import { PendingStickersCard } from './components/pending-stickers-card'
import { StickerCard } from './components/sticker-card'
import { buildStickerCounts, filterStickers } from './helpers/sticker-summary'
import { STICKER_FILTERS, type StickerFilter } from './stickers.const'
import { stickersLoader } from './servers/stickers.loader'
import { stickersAction } from './servers/stickers.action'
import type { Route } from './+types/_index'

export function meta() {
	return pageMeta({
		title: 'Mes stickers',
		description: 'Activez et gérez les stickers QR de vos objets.',
	})
}

export const loader = stickersLoader

export const action = stickersAction

export default function StickersPage({ loaderData }: Route.ComponentProps) {
	const { stickers, summary } = loaderData
	const [filter, setFilter] = useState<StickerFilter>('all')

	const counts = buildStickerCounts(stickers)
	const visible = filterStickers(stickers, filter)
	// Nothing bought, nothing activated: the account has never held a sticker.
	const isEmpty = summary.delivered === 0 && stickers.length === 0

	return (
		<main className="flex-1">
			<section className="border-b">
				<div className="container mx-auto px-4 py-6">
					<Link
						to="/account"
						className="text-muted-foreground hover:text-foreground touch-target mb-4 inline-flex items-center gap-1.5 text-sm transition-colors"
					>
						<ArrowLeft className="h-4 w-4" />
						Retour au compte
					</Link>
					<h1 className="mb-4 text-2xl font-bold">Mes stickers</h1>

					{summary.delivered > 0 && (
						<div className="mb-4">
							<ActivationProgress summary={summary} />
						</div>
					)}

					{/*
					 * The scan leads now: R20 put a camera behind it and R22 lets it
					 * activate, so typing « RCI-4A7F-2K91 » twelve times is no longer
					 * the shortest path. The field stays, one tap away.
					 */}
					{/* 16 px, not the artboard's tight 8: the code link's tap area is
					    extended to 44 px by `.touch-target`, and a smaller gap would
					    have it overlap the button above. */}
					<div className="max-w-md space-y-4">
						<Button
							asChild
							className="bg-primary-green hover:bg-primary-green-dark h-control w-full gap-2 rounded-[14px] text-lg text-white"
						>
							<Link to="/scan">
								<ScanLine className="h-4.5 w-4.5" />
								Scanner un sticker
							</Link>
						</Button>
						<p className="text-muted-foreground text-center text-xs">
							ou{' '}
							<ActivateStickerDialog
								trigger={
									<button
										type="button"
										className="text-primary-green-text touch-target font-semibold hover:underline"
									>
										saisir un code à la main
									</button>
								}
							/>
						</p>
					</div>
				</div>
			</section>

			{stickers.length > 0 && (
				<section className="border-b py-4">
					<div className="container mx-auto px-4">
						<div
							className="flex flex-wrap items-center gap-2"
							role="group"
							aria-label="État des stickers"
						>
							{STICKER_FILTERS.map(({ id, label, activeClassName }) => (
								<FilterPill
									key={id}
									active={filter === id}
									onClick={() => setFilter(id)}
									className={filter === id ? activeClassName : undefined}
								>
									{label}
									<span className="tabular-nums opacity-70">
										<span aria-hidden>·</span> {counts[id]}
									</span>
								</FilterPill>
							))}
						</div>
					</div>
				</section>
			)}

			<section className="py-6">
				<div className="container mx-auto max-w-2xl space-y-3 px-4">
					{isEmpty ? (
						<div className="bg-muted/30 rounded-2xl border-2 border-dashed py-16 text-center">
							<div className="bg-muted mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl">
								<QrCode className="text-muted-foreground h-8 w-8" />
							</div>
							<h2 className="mb-2 text-lg font-semibold">Aucun sticker</h2>
							<p className="text-muted-foreground mx-auto max-w-sm text-sm">
								Activez votre premier sticker pour qu&apos;un objet retrouvé
								vous revienne.
							</p>
						</div>
					) : visible.length === 0 && stickers.length > 0 ? (
						<div className="bg-muted/30 rounded-2xl border-2 border-dashed py-12 text-center">
							<h2 className="mb-2 text-lg font-semibold">Aucun résultat</h2>
							<p className="text-muted-foreground text-sm">
								Aucun sticker n&apos;est dans cet état.
							</p>
						</div>
					) : (
						visible.map(sticker => (
							<StickerCard key={sticker.id} sticker={sticker} />
						))
					)}

					{/* Only under « Tous »: a state filter must not hide the batch. */}
					{summary.pending > 0 && filter === 'all' && (
						<PendingStickersCard pending={summary.pending} />
					)}

					<div className="pt-3">
						<OrderMoreCta hasStickers={!isEmpty} />
					</div>
				</div>
			</section>
		</main>
	)
}

/** The fourth state of §2.3 rule 5, as R13 draws it on « Mes annonces ». */
export function ErrorBoundary() {
	return (
		<main className="flex-1">
			<div className="container mx-auto px-4 py-16">
				<div className="bg-muted/30 mx-auto max-w-md rounded-2xl border-2 border-dashed py-12 text-center">
					<TriangleAlert className="text-muted-foreground mx-auto mb-3 h-10 w-10" />
					<h1 className="mb-2 text-lg font-semibold">
						Impossible d&apos;afficher vos stickers
					</h1>
					<p className="text-muted-foreground mx-auto mb-6 max-w-xs text-sm">
						Le service est momentanément indisponible. Vos stickers, eux,
						restent actifs.
					</p>
					<div className="flex flex-wrap items-center justify-center gap-3">
						<Button
							onClick={() => window.location.reload()}
							className="bg-primary-green hover:bg-primary-green-dark rounded-xl text-white"
						>
							Réessayer
						</Button>
						<Button asChild variant="outline" className="rounded-xl">
							<Link to="/account">Retour au compte</Link>
						</Button>
					</div>
				</div>
			</div>
		</main>
	)
}
