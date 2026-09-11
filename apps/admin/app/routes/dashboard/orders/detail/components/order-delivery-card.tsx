import { Card, CardContent, CardHeader, CardTitle } from '@app/ui/components'
import type { StickerOrder } from '../../types/orders.types'

export function OrderDeliveryCard({ order }: { order: StickerOrder }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Livraison</CardTitle>
			</CardHeader>
			<CardContent>
				<dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
					<dt className="text-muted-foreground">Adresse</dt>
					<dd>{order.deliveryAddress}</dd>
					<dt className="text-muted-foreground">Ville</dt>
					<dd>{order.deliveryCity}</dd>
					{order.deliveryNotes && (
						<>
							<dt className="text-muted-foreground">Consignes</dt>
							<dd className="whitespace-pre-line">{order.deliveryNotes}</dd>
						</>
					)}
					<dt className="text-muted-foreground">N° de suivi</dt>
					<dd className="font-mono">
						{order.trackingNumber ?? (
							<span className="text-muted-foreground">—</span>
						)}
					</dd>
				</dl>
			</CardContent>
		</Card>
	)
}
