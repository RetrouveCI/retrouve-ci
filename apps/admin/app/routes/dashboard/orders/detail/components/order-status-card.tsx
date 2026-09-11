import { useState } from 'react'
import { Link } from 'react-router'
import type { FieldValues } from 'react-hook-form'
import { toast } from 'sonner'
import { UserRound, XCircle } from 'lucide-react'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@app/ui/components'
import { useActionFetcher } from '@/shared/hooks/use-action-fetcher'
import { useSettledSubmission } from '@/shared/hooks/use-settled-submission'
import {
	CANCELLABLE_ORDER_STATUSES,
	NEXT_ORDER_STATUS,
	ORDER_STATUS_CONFIG,
} from '../../orders.const'
import type { ordersAction } from '../../servers/orders.action'
import type { OrderStatus, StickerOrder } from '../../types/orders.types'

export function OrderStatusCard({ order }: { order: StickerOrder }) {
	const [confirmCancel, setConfirmCancel] = useState(false)
	const fetcher = useActionFetcher<
		typeof ordersAction,
		FieldValues,
		StickerOrder
	>()

	useSettledSubmission(fetcher.response, result => {
		if (!result.success) {
			toast.error(
				result.errors?.root?.message ?? 'Impossible de mettre à jour le statut',
			)
			return
		}

		if (result.data) {
			toast.success(
				`Commande ${result.data.orderNumber} — ${ORDER_STATUS_CONFIG[result.data.status].label}`,
			)
		}
	})

	const moveTo = (status: OrderStatus) => {
		fetcher.submit({ id: order.id, status }, { method: 'post' })
	}

	const next = NEXT_ORDER_STATUS[order.status]
	const NextIcon = next ? ORDER_STATUS_CONFIG[next.status].icon : null
	const cancellable = CANCELLABLE_ORDER_STATUSES.includes(order.status)

	return (
		<Card>
			<CardHeader>
				<CardTitle>Changer le statut</CardTitle>
			</CardHeader>
			<CardContent className="space-y-2">
				{next && NextIcon ? (
					<Button
						className="w-full justify-start"
						disabled={fetcher.isSubmitting}
						onClick={() => moveTo(next.status)}
					>
						<NextIcon className="mr-2 h-4 w-4" />
						{next.label}
					</Button>
				) : (
					<p className="text-muted-foreground text-sm">
						Commande {ORDER_STATUS_CONFIG[order.status].label.toLowerCase()} :
						plus rien à faire.
					</p>
				)}

				{cancellable && (
					<Button
						variant="outline"
						className="text-destructive hover:text-destructive w-full justify-start"
						disabled={fetcher.isSubmitting}
						onClick={() => setConfirmCancel(true)}
					>
						<XCircle className="mr-2 h-4 w-4" />
						Annuler la commande
					</Button>
				)}

				<p className="text-muted-foreground text-xs">
					L’acheteur est prévenu à chaque étape.
				</p>

				<Button variant="ghost" className="w-full justify-start" asChild>
					<Link to={`/users/${order.userId}`}>
						<UserRound className="mr-2 h-4 w-4" />
						Voir le client
					</Link>
				</Button>
			</CardContent>

			<AlertDialog open={confirmCancel} onOpenChange={setConfirmCancel}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Annuler cette commande ?</AlertDialogTitle>
						<AlertDialogDescription>
							L’acheteur en est prévenu. Une commande annulée ne revient pas en
							arrière.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Garder la commande</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							onClick={() => moveTo('cancelled')}
						>
							Annuler la commande
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Card>
	)
}
