import { Link } from 'react-router'
import {
	Button,
	Badge,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@app/ui/components'
import { STICKER_ORDER_STATUSES } from '@app/contracts/sticker-orders'
import { BentoCard } from '@/components/bento-card'
import { BatchBar } from '@/components/batch-bar'
import { DataTable } from '@/components/data-table'
import { DensityToggle } from '@/components/density-toggle'
import { ListToolbar } from '@/components/list-toolbar'
import { OrderStatsGrid } from './components/order-stats-grid'
import { ordersLoader } from './servers/orders.loader'
import { ordersAction } from './servers/orders.action'
import {
	batchMessage,
	batchSucceeded,
	isBatchOutcome,
} from '@/shared/helpers/batch-report'
import { batchStep } from './helpers/batch-step'
import { usePageSelection } from '@/shared/hooks/use-page-selection'
import { useActionFetcher } from '@/shared/hooks/use-action-fetcher'
import { useSettledSubmission } from '@/shared/hooks/use-settled-submission'
import type { FieldValues } from 'react-hook-form'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import type { ColumnDef } from '@tanstack/react-table'
import type { StickerOrder, OrderStatus } from './types/orders.types'
import type { BatchOutcome } from '@app/contracts/shared'
import {
	CANCELLABLE_ORDER_STATUSES,
	NEXT_ORDER_STATUS,
	ORDER_STATUS_CONFIG,
} from './orders.const'
import type { RouteHandle } from '@/shared/helpers/page-meta'
import type { Route } from './+types/_index'
import { MoreHorizontal, Eye, XCircle, Download, Package } from 'lucide-react'

export const loader = ordersLoader
export const action = ordersAction

export const handle: RouteHandle = { title: 'Commandes de stickers' }

/** What a chip reads, in the plural, for the list it filters to. */
const STATUS_FILTER_LABELS: Record<OrderStatus, string> = {
	pending: 'En attente',
	processing: 'En traitement',
	shipped: 'Expédiées',
	delivered: 'Livrées',
	cancelled: 'Annulées',
}

export default function OrdersPage({ loaderData }: Route.ComponentProps) {
	const { orders, total, page, pageSize, counts } = loaderData
	const [selected, setSelected] = usePageSelection()
	const step = batchStep(orders, selected)

	const batchFetcher = useActionFetcher<
		typeof ordersAction,
		FieldValues,
		BatchOutcome
	>()

	useSettledSubmission(batchFetcher.response, result => {
		if (!result.success) {
			toast.error(
				result.errors?.root?.message ??
					'Impossible de faire avancer la sélection',
			)
			return
		}

		const outcome = result.data
		if (!isBatchOutcome(outcome)) return

		const message = batchMessage(outcome, {
			one: 'commande mise à jour',
			many: 'commandes mises à jour',
		})

		if (batchSucceeded(outcome)) toast.success(message)
		else toast.error(message)

		// What stays ticked is what did not go through.
		setSelected(outcome.failed.map(item => item.id))
	})

	const statusFetcher = useActionFetcher<
		typeof ordersAction,
		FieldValues,
		StickerOrder
	>()

	useSettledSubmission(statusFetcher.response, result => {
		if (!result.success) {
			toast.error(
				result.errors?.root?.message ?? 'Impossible de mettre à jour le statut',
			)
			return
		}

		// The list's action serves its selection too, so it answers a union.
		const order = result.data

		if (order && !isBatchOutcome(order))
			toast.success(
				`Commande ${order.orderNumber} — ${ORDER_STATUS_CONFIG[order.status].label}`,
			)
	})

	const updateStatus = (id: string, status: OrderStatus) => {
		statusFetcher.submit({ id, status }, { method: 'post' })
	}

	// The page on screen, and said so: the list is paged on the server now.
	const handleExportCSV = () => {
		const headers = [
			'N° commande',
			'Pack',
			'Quantité',
			'Total',
			'Statut',
			'Ville',
			'Adresse',
			'Commandé le',
			'Expédié le',
			'Livré le',
			'Suivi',
		]
		const rows = orders.map(o => [
			o.orderNumber,
			o.packName,
			o.quantity,
			o.total,
			ORDER_STATUS_CONFIG[o.status].label,
			o.deliveryCity,
			o.deliveryAddress,
			format(new Date(o.createdAt), 'dd/MM/yyyy', { locale: fr }),
			o.shippedAt
				? format(new Date(o.shippedAt), 'dd/MM/yyyy', { locale: fr })
				: '-',
			o.deliveredAt
				? format(new Date(o.deliveredAt), 'dd/MM/yyyy', { locale: fr })
				: '-',
			o.trackingNumber ?? '-',
		])
		const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
		const blob = new Blob([csv], { type: 'text/csv' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = `commandes-stickers-page-${page}.csv`
		a.click()
		URL.revokeObjectURL(url)
		toast.success('Export CSV téléchargé')
	}

	const columns: ColumnDef<StickerOrder>[] = [
		{
			accessorKey: 'orderNumber',
			header: 'N° commande',
			cell: ({ row }) => (
				<Link
					to={`/orders/${row.original.id}`}
					className="font-mono text-sm font-medium hover:underline"
				>
					{row.original.orderNumber}
				</Link>
			),
		},
		{
			accessorKey: 'packName',
			header: 'Pack',
			cell: ({ row }) => (
				<div>
					<p className="text-sm font-medium">{row.original.packName}</p>
					<Link
						to={`/users/${row.original.userId}`}
						className="text-primary text-xs hover:underline"
					>
						Voir le client
					</Link>
				</div>
			),
		},
		{
			accessorKey: 'quantity',
			header: 'Quantité',
			cell: ({ row }) => (
				<div className="flex items-center gap-1.5">
					<Package className="text-muted-foreground h-3.5 w-3.5" />
					<span className="font-semibold">{row.original.quantity}</span>
				</div>
			),
		},
		{
			accessorKey: 'status',
			header: 'Statut',
			cell: ({ row }) => {
				const cfg = ORDER_STATUS_CONFIG[row.original.status]
				return <Badge className={cfg.className}>{cfg.label}</Badge>
			},
		},
		{
			accessorKey: 'deliveryCity',
			header: 'Ville',
			cell: ({ row }) => (
				<span className="text-muted-foreground text-sm">
					{row.original.deliveryCity}
				</span>
			),
		},
		{
			accessorKey: 'createdAt',
			header: 'Date commande',
			cell: ({ row }) =>
				format(new Date(row.original.createdAt), 'dd MMM yyyy', { locale: fr }),
		},
		{
			accessorKey: 'trackingNumber',
			header: 'N° suivi',
			cell: ({ row }) =>
				row.original.trackingNumber ? (
					<span className="font-mono text-xs">
						{row.original.trackingNumber}
					</span>
				) : (
					<span className="text-muted-foreground">—</span>
				),
		},
		{
			id: 'actions',
			header: 'Actions',
			cell: ({ row }) => {
				const o = row.original
				const next = NEXT_ORDER_STATUS[o.status]
				const NextIcon = next ? ORDER_STATUS_CONFIG[next.status].icon : null

				return (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon" className="h-8 w-8">
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-52">
							<DropdownMenuItem asChild>
								<Link to={`/orders/${o.id}`}>
									<Eye className="mr-2 h-4 w-4" /> Voir la fiche
								</Link>
							</DropdownMenuItem>
							{next && NextIcon && (
								<>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={() => updateStatus(o.id, next.status)}
									>
										<NextIcon className="mr-2 h-4 w-4" /> {next.label}
									</DropdownMenuItem>
								</>
							)}
							{CANCELLABLE_ORDER_STATUSES.includes(o.status) && (
								<>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										className="text-destructive focus:text-destructive"
										onClick={() => updateStatus(o.id, 'cancelled')}
									>
										<XCircle className="mr-2 h-4 w-4" /> Annuler la commande
									</DropdownMenuItem>
								</>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				)
			},
		},
	]

	return (
		<div className="space-y-4 p-4 lg:p-6">
			{/* Counted by the API over every order: a counter it cannot serve
			    hides the grid rather than showing zeros. */}
			{counts && (
				<OrderStatsGrid
					total={counts.all ?? 0}
					pending={counts.pending ?? 0}
					processing={counts.processing ?? 0}
					shipped={counts.shipped ?? 0}
					delivered={counts.delivered ?? 0}
				/>
			)}

			<BentoCard variant="table">
				<ListToolbar
					chips={[
						{ value: 'all', label: 'Toutes', count: counts?.all },
						...STICKER_ORDER_STATUSES.map(status => ({
							value: status,
							label: STATUS_FILTER_LABELS[status],
							count: counts?.[status],
						})),
					]}
					searchPlaceholder="N° de commande, ville, adresse…"
				>
					<DensityToggle />
					<Button variant="outline" size="sm" onClick={handleExportCSV}>
						<Download className="mr-2 h-4 w-4" /> Exporter la page
					</Button>
				</ListToolbar>
				<BatchBar
					selected={selected}
					onClear={() => setSelected([])}
					action={step.kind === 'ready' ? step.label : 'Faire avancer'}
					disabled={step.kind !== 'ready'}
					hint={step.kind === 'blocked' ? step.reason : undefined}
					confirmTitle={`Faire avancer ${selected.length} commande${selected.length > 1 ? 's' : ''} ?`}
					confirmBody={
						step.kind === 'ready' && step.status === 'shipped'
							? 'Chaque acheteur est prévenu que sa commande part, avec la somme à préparer en espèces pour le coursier. Cette annonce ne se reprend pas.'
							: 'Chaque acheteur concerné en est prévenu.'
					}
					submitting={batchFetcher.isSubmitting}
					onConfirm={() => {
						if (step.kind !== 'ready') return

						batchFetcher.submit(
							{
								intent: 'status-batch',
								status: step.status,
								ids: selected,
							},
							{ method: 'post' },
						)
					}}
				/>
				<div className="p-4">
					<DataTable
						columns={columns}
						data={orders}
						pagination={{ page, pageSize, total }}
						selection={{
							selected,
							onChange: setSelected,
							idOf: order => order.id,
							label: order => `Sélectionner la commande ${order.orderNumber}`,
						}}
					/>
				</div>
			</BentoCard>
		</div>
	)
}
