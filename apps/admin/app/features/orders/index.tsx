import { useEffect, useState } from 'react'
import { useSearchParams, useFetcher, Link } from 'react-router'
import {
	Button,
	Badge,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@retrouve-ci/ui/components'
import { BentoCard } from '@/shared/components/bento-card'
import { DataTable } from '@/shared/components/data-table'
import { DateRangePicker } from '@/shared/components/date-range-picker'
import { OrderDetailDialog } from './components/order-detail-dialog'
import { OrderStatsGrid } from './components/order-stats-grid'
import { ordersLoader } from './servers/orders.loader'
import { ordersAction } from './servers/orders.action'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import type { DateRange } from 'react-day-picker'
import type { ColumnDef } from '@tanstack/react-table'
import type { StickerOrder, OrderStatus } from './orders.types'
import type { RouteHandle } from '@/shared/lib/page-meta'
import type { Route } from './+types/index'
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
		className: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-50',
		icon: Clock,
	},
	processing: {
		label: 'En traitement',
		className: 'bg-blue-50 text-blue-700 hover:bg-blue-50',
		icon: Package,
	},
	shipped: {
		label: 'Expédiée',
		className: 'bg-purple-50 text-purple-700 hover:bg-purple-50',
		icon: Truck,
	},
	delivered: {
		label: 'Livrée',
		className: 'bg-green-50 text-green-700 hover:bg-green-50',
		icon: PackageCheck,
	},
	cancelled: {
		label: 'Annulée',
		className: 'bg-red-50 text-red-700 hover:bg-red-50',
		icon: XCircle,
	},
}

interface ActionResult {
	ok: boolean
	order?: StickerOrder
	error?: string
}

export default function OrdersPage({ loaderData }: Route.ComponentProps) {
	const { orders, statusFilter } = loaderData
	const [searchParams, setSearchParams] = useSearchParams()
	const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
	const [selectedOrder, setSelectedOrder] = useState<StickerOrder | null>(null)
	const [detailOpen, setDetailOpen] = useState(false)

	const statusFetcher = useFetcher<ActionResult>()

	useEffect(() => {
		if (statusFetcher.state !== 'idle' || !statusFetcher.data) return
		if (statusFetcher.data.ok) {
			const order = statusFetcher.data.order
			if (order)
				toast.success(
					`Commande ${order.orderNumber} — ${STATUS_CONFIG[order.status].label}`,
				)
		} else {
			toast.error(
				statusFetcher.data.error ?? 'Impossible de mettre à jour le statut',
			)
		}
	}, [statusFetcher.state, statusFetcher.data])

	const updateStatus = (id: string, status: OrderStatus) => {
		statusFetcher.submit({ id, status }, { method: 'post' })
	}

	const handleFilterChange = (value: string) => {
		const next = new URLSearchParams(searchParams)
		if (value === 'all') {
			next.delete('status')
		} else {
			next.set('status', value)
		}
		setSearchParams(next)
	}

	let filteredOrders = orders
	if (dateRange?.from) {
		filteredOrders = filteredOrders.filter(o => {
			const d = new Date(o.createdAt)
			return d >= dateRange.from! && (!dateRange.to || d <= dateRange.to)
		})
	}

	const counts = {
		total: orders.length,
		pending: orders.filter(o => o.status === 'pending').length,
		processing: orders.filter(o => o.status === 'processing').length,
		shipped: orders.filter(o => o.status === 'shipped').length,
		delivered: orders.filter(o => o.status === 'delivered').length,
	}

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
		const rows = filteredOrders.map(o => [
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
		a.download = 'commandes-stickers.csv'
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
					<OrderStatsGrid
						total={counts.total}
						pending={counts.pending}
						processing={counts.processing}
						shipped={counts.shipped}
						delivered={counts.delivered}
					/>

					<BentoCard variant="table">
						<div className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
							<div className="flex flex-wrap items-center gap-3">
								<Select value={statusFilter} onValueChange={handleFilterChange}>
									<SelectTrigger className="h-9 w-44">
										<SelectValue placeholder="Statut" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">Tous les statuts</SelectItem>
										<SelectItem value="pending">En attente</SelectItem>
										<SelectItem value="processing">En traitement</SelectItem>
										<SelectItem value="shipped">Expédiées</SelectItem>
										<SelectItem value="delivered">Livrées</SelectItem>
										<SelectItem value="cancelled">Annulées</SelectItem>
									</SelectContent>
								</Select>
								<DateRangePicker
									dateRange={dateRange}
									onDateRangeChange={setDateRange}
								/>
							</div>
							<Button variant="outline" size="sm" onClick={handleExportCSV}>
								<Download className="mr-2 h-4 w-4" /> Exporter CSV
							</Button>
						</div>
						<div className="p-4">
							<DataTable
								columns={columns}
								data={filteredOrders}
								searchKey="orderNumber"
								searchPlaceholder="Rechercher par N° commande..."
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
