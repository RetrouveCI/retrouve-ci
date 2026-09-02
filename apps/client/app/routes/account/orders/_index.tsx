import { Button } from '@app/ui/components'
import { Link } from 'react-router'
import { ArrowLeft, Package, TriangleAlert } from 'lucide-react'
import { pageMeta } from '@/shared/helpers/page-meta'
import { ActiveOrderCard } from './components/active-order-card'
import { OrderCard } from './components/order-card'
import { ReorderCta } from './components/reorder-cta'
import { isOrderInFlight } from './helpers/order-progress'
import { ordersLoader } from './servers/orders.loader'
import type { Route } from './+types/_index'

export function meta() {
	return pageMeta({
		title: 'Mes commandes',
		description: 'Suivez la livraison de vos stickers QR RetrouveCI.',
	})
}

export const loader = ordersLoader

export default function OrdersPage({ loaderData }: Route.ComponentProps) {
	const { orders } = loaderData

	const inFlight = orders.filter(isOrderInFlight)
	const history = orders.filter(order => !isOrderInFlight(order))

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
					<h1 className="text-2xl font-bold">Mes commandes</h1>
					<p className="text-muted-foreground text-sm">
						{orders.length} commande{orders.length > 1 ? 's' : ''} au total
					</p>
				</div>
			</section>

			<section className="py-6">
				<div className="container mx-auto max-w-2xl space-y-3 px-4">
					{orders.length === 0 ? (
						<div className="bg-muted/30 rounded-2xl border-2 border-dashed py-16 text-center">
							<div className="bg-muted mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl">
								<Package className="text-muted-foreground h-8 w-8" />
							</div>
							<h2 className="mb-2 text-lg font-semibold">Aucune commande</h2>
							<p className="text-muted-foreground mx-auto max-w-sm text-sm">
								Vous n&apos;avez pas encore commandé de stickers QR.
							</p>
						</div>
					) : (
						<>
							{inFlight.map(order => (
								<ActiveOrderCard key={order.id} order={order} />
							))}

							{history.length > 0 && (
								<>
									<h2 className="text-muted-foreground pt-4 text-xs font-semibold tracking-[0.1em] uppercase">
										Historique
									</h2>
									{history.map(order => (
										<OrderCard key={order.id} order={order} />
									))}
								</>
							)}
						</>
					)}

					<div className="pt-3">
						<ReorderCta lastOrder={orders[0]} />
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
						Impossible d&apos;afficher vos commandes
					</h1>
					<p className="text-muted-foreground mx-auto mb-6 max-w-xs text-sm">
						Le service est momentanément indisponible. Vos commandes, elles,
						suivent leur cours.
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
