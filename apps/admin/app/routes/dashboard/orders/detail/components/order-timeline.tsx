import { Card, CardContent, CardHeader, CardTitle } from '@app/ui/components'
import { cn } from '@app/ui/utils'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { StickerOrder } from '../../types/orders.types'

interface Step {
	label: string
	at: string | null
	done: boolean
}

function stepsOf(order: StickerOrder): Step[] {
	if (order.status === 'cancelled') {
		// No column dates the cancellation, so it is said without a date.
		return [
			{ label: 'Commande passée', at: order.createdAt, done: true },
			{ label: 'Annulée', at: null, done: true },
		]
	}

	return [
		{ label: 'Commande passée', at: order.createdAt, done: true },
		{
			label: 'En traitement',
			at: null,
			done: order.status !== 'pending',
		},
		{ label: 'Expédiée', at: order.shippedAt, done: order.shippedAt !== null },
		{
			label: 'Livrée',
			at: order.deliveredAt,
			done: order.deliveredAt !== null,
		},
	]
}

export function OrderTimeline({ order }: { order: StickerOrder }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Suivi</CardTitle>
			</CardHeader>
			<CardContent>
				<ol className="space-y-3">
					{stepsOf(order).map(step => (
						<li key={step.label} className="flex items-start gap-3">
							<span
								aria-hidden
								className={cn(
									'mt-1 h-3 w-3 shrink-0 rounded-full border-2',
									step.done
										? 'border-primary bg-primary'
										: 'border-muted-foreground/40 bg-card',
								)}
							/>
							<div>
								<p
									className={cn(
										'text-sm font-medium',
										!step.done && 'text-muted-foreground',
									)}
								>
									{step.label}
								</p>
								{step.at && (
									<p className="text-muted-foreground font-mono text-xs">
										{format(new Date(step.at), "d MMM yyyy 'à' HH:mm", {
											locale: fr,
										})}
									</p>
								)}
							</div>
						</li>
					))}
				</ol>
			</CardContent>
		</Card>
	)
}
