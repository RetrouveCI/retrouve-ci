import { useState } from 'react'
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
import { DataTable } from '@/components/data-table'
import { DensityToggle } from '@/components/density-toggle'
import { ListToolbar } from '@/components/list-toolbar'
import { STATUS_TONE_CLASSES } from '@/shared/constants/status-tone'
import { OrderDetailDialog } from './components/order-detail-dialog'
import { OrderStatsGrid } from './components/order-stats-grid'
import { ordersLoader } from './servers/orders.loader'
import { ordersAction } from './servers/orders.action'
import { useActionFetcher } from '@/shared/hooks/use-action-fetcher'
import { useSettledSubmission } from '@/shared/hooks/use-settled-submission'
import type { FieldValues } from 'react-hook-form'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import type { ColumnDef } from '@tanstack/react-table'
import type { StickerOrder, OrderStatus } from './types/orders.types'
import type { RouteHandle } from '@/shared/helpers/page-meta'
import type { Route } from './+types/_index'
import {
	MoreHorizontal,
	Eye,
	Truck,
	CheckCircle2,
	XCircle,
	Download,
	Package,
	Clock,
	PackageCheck,
} from 'lucide-react'

export const loader = ordersLoader
export const action = ordersAction

export const handle: RouteHandle = { title: 'Commandes de stickers' }

const STATUS_CONFIG: Record<
	OrderStatus,
	{ label: string; className: string; icon: React.ElementType }
> = {
	pending: {
		label: 'En attente',
		className: STATUS_TONE_CLASSES.warning,
		icon: Clock,
	},
	processing: {
		label: 'En traitement',
		className: STATUS_TONE_CLASSES.info,
		icon: Package,
	},
	shipped: {
		label: 'Expédiée',
		className: STATUS_TONE_CLASSES.purple,
		icon: Truck,
	},
	delivered: {
		label: 'Livrée',
		className: STATUS_TONE_CLASSES.success,
		icon: PackageCheck,
	},
	cancelled: {
		label: 'Annulée',
		className: STATUS_TONE_CLASSES.danger,
		icon: XCircle,
	},
}

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
	const [selectedOrder, setSelectedOrder] = useState<StickerOrder | null>(null)
	const [detailOpen, setDetailOpen] = useState(false)

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

		const order = result.data

		if (order)
			toast.success(
				`Commande ${order.orderNumber} — ${STATUS_CONFIG[order.status].label}`,
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
			STATUS_CONFIG[o.status].label,
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
				<span className="font-mono text-sm font-medium">
					{row.original.orderNumber}
				</span>
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
				const cfg = STATUS_CONFIG[row.original.status]
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
				return (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon" className="h-8 w-8">
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-52">
							<DropdownMenuItem
								onClick={() => {
									setSelectedOrder(o)
									setDetailOpen(true)
								}}
							>
								<Eye className="mr-2 h-4 w-4" /> Voir les détails
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							{o.status === 'pending' && (
								<DropdownMenuItem
									onClick={() => updateStatus(o.id, 'processing')}
								>
									<Package className="mr-2 h-4 w-4" /> Marquer en traitement
								</DropdownMenuItem>
							)}
							{o.status === 'processing' && (
								<DropdownMenuItem onClick={() => updateStatus(o.id, 'shipped')}>
									<Truck className="mr-2 h-4 w-4" /> Marquer comme expédiée
								</DropdownMenuItem>
							)}
							{o.status === 'shipped' && (
								<DropdownMenuItem
									onClick={() => updateStatus(o.id, 'delivered')}
								>
									<CheckCircle2 className="mr-2 h-4 w-4" /> Marquer comme livrée
								</DropdownMenuItem>
							)}
							{(o.status === 'pending' || o.status === 'processing') && (
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
		<>
			<div>
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
						<div className="p-4">
							<DataTable
								columns={columns}
								data={orders}
								pagination={{ page, pageSize, total }}
							/>
						</div>
					</BentoCard>
				</div>
			</div>

			<OrderDetailDialog
				order={selectedOrder}
				open={detailOpen}
				onOpenChange={setDetailOpen}
			/>
		</>
	)
}
