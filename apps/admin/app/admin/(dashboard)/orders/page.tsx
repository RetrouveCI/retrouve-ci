'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/admin/topbar'
import { DataTable } from '@/components/admin/data-table'
import { DateRangePicker } from '@/components/admin/date-range-picker'
import { BentoCard } from '@/components/admin/bento-card'
import { Button } from '@retrouve-ci/ui/components/ui/button'
import { Badge } from '@retrouve-ci/ui/components/ui/badge'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@retrouve-ci/ui/components/ui/select'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@retrouve-ci/ui/components/ui/dialog'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@retrouve-ci/ui/components/ui/dropdown-menu'
import { mockStickerOrders } from '@/lib/mock-data'
import type { StickerOrder } from '@/lib/types'
import type { DateRange } from 'react-day-picker'
import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
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

const statusConfig: Record<
	StickerOrder['status'],
	{ label: string; className: string; icon: React.ElementType }
> = {
	pending: {
		label: 'En attente',
		className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
		icon: Clock,
	},
	processing: {
		label: 'En traitement',
		className: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
		icon: Package,
	},
	shipped: {
		label: 'Expédiée',
		className: 'bg-purple-100 text-purple-700 hover:bg-purple-100',
		icon: Truck,
	},
	delivered: {
		label: 'Livrée',
		className: 'bg-green-100 text-green-700 hover:bg-green-100',
		icon: PackageCheck,
	},
	cancelled: {
		label: 'Annulée',
		className: 'bg-red-100 text-red-700 hover:bg-red-100',
		icon: XCircle,
	},
}

function OrderDetailDialog({
	order,
	open,
	onOpenChange,
}: {
	order: StickerOrder | null
	open: boolean
	onOpenChange: (v: boolean) => void
}) {
	if (!order) return null
	const cfg = statusConfig[order.status]
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Package className="text-primary h-5 w-5" />
						Commande {order.id}
					</DialogTitle>
				</DialogHeader>
				<div className="space-y-5 py-2">
					<div className="bg-muted/50 flex items-center justify-between rounded-xl px-4 py-3">
						<span className="text-muted-foreground text-sm font-medium">
							Statut
						</span>
						<Badge className={cfg.className}>{cfg.label}</Badge>
					</div>
					<div>
						<p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
							Client
						</p>
						<div className="bg-card space-y-1.5 rounded-xl border p-4">
							<p className="font-semibold">{order.userName}</p>
							<p className="text-muted-foreground text-sm">{order.userEmail}</p>
							<p className="text-muted-foreground text-sm">{order.userPhone}</p>
						</div>
					</div>
					<div>
						<p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
							Livraison
						</p>
						<div className="bg-card space-y-1.5 rounded-xl border p-4">
							<p className="text-sm">{order.deliveryAddress}</p>
							<p className="text-muted-foreground text-sm">
								{order.deliveryCity}
							</p>
							{order.deliveryNotes && (
								<p className="bg-muted text-muted-foreground mt-2 rounded-lg px-3 py-2 text-xs italic">
									{order.deliveryNotes}
								</p>
							)}
						</div>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<div className="bg-card rounded-xl border p-3 text-center">
							<p className="text-primary text-2xl font-bold">
								{order.quantity}
							</p>
							<p className="text-muted-foreground text-xs">
								sticker{order.quantity > 1 ? 's' : ''}
							</p>
						</div>
						<div className="bg-card rounded-xl border p-3 text-center">
							<p className="text-sm font-semibold">
								{order.trackingNumber ?? (
									<span className="text-muted-foreground">—</span>
								)}
							</p>
							<p className="text-muted-foreground text-xs">N° de suivi</p>
						</div>
					</div>
					<div>
						<p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
							Historique
						</p>
						<div className="bg-card space-y-2 rounded-xl border p-4 text-sm">
							<div className="flex justify-between">
								<span className="text-muted-foreground">Commandé le</span>
								<span>
									{format(new Date(order.createdAt), "dd MMM yyyy 'à' HH:mm", {
										locale: fr,
									})}
								</span>
							</div>
							{order.shippedAt && (
								<div className="flex justify-between">
									<span className="text-muted-foreground">Expédié le</span>
									<span>
										{format(
											new Date(order.shippedAt),
											"dd MMM yyyy 'à' HH:mm",
											{ locale: fr },
										)}
									</span>
								</div>
							)}
							{order.deliveredAt && (
								<div className="flex justify-between">
									<span className="text-muted-foreground">Livré le</span>
									<span>
										{format(
											new Date(order.deliveredAt),
											"dd MMM yyyy 'à' HH:mm",
											{ locale: fr },
										)}
									</span>
								</div>
							)}
						</div>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Fermer
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

export default function OrdersPage() {
	const [statusFilter, setStatusFilter] = useState<string>('all')
	const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
	const [selectedOrder, setSelectedOrder] = useState<StickerOrder | null>(null)
	const [detailOpen, setDetailOpen] = useState(false)
	const [orders, setOrders] = useState<StickerOrder[]>(mockStickerOrders)

	const updateStatus = (id: string, status: StickerOrder['status']) => {
		setOrders(prev =>
			prev.map(o =>
				o.id === id
					? {
							...o,
							status,
							updatedAt: new Date().toISOString(),
							shippedAt:
								status === 'shipped' ? new Date().toISOString() : o.shippedAt,
							deliveredAt:
								status === 'delivered'
									? new Date().toISOString()
									: o.deliveredAt,
						}
					: o,
			),
		)
		toast.success(`Commande ${id} — ${statusConfig[status].label}`)
	}

	let filteredOrders = orders
	if (statusFilter !== 'all')
		filteredOrders = filteredOrders.filter(o => o.status === statusFilter)
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
			'ID',
			'Client',
			'Email',
			'Téléphone',
			'Quantité',
			'Statut',
			'Ville',
			'Adresse',
			'Commandé le',
			'Expédié le',
			'Livré le',
			'Suivi',
		]
		const rows = filteredOrders.map(o => [
			o.id,
			o.userName,
			o.userEmail,
			o.userPhone,
			o.quantity,
			statusConfig[o.status].label,
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
			accessorKey: 'id',
			header: 'N° commande',
			cell: ({ row }) => (
				<span className="font-mono text-sm font-medium">{row.original.id}</span>
			),
		},
		{
			accessorKey: 'userName',
			header: 'Client',
			cell: ({ row }) => (
				<div>
					<Link
						href={`/admin/users/${row.original.userId}`}
						className="text-primary text-sm font-medium hover:underline"
					>
						{row.original.userName}
					</Link>
					<p className="text-muted-foreground text-xs">
						{row.original.userPhone}
					</p>
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
				const cfg = statusConfig[row.original.status]
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
			<TopBar title="Commandes de stickers" />
			<div className="pt-16">
				<div className="space-y-4 p-4 lg:p-6">
					{/* Bento stat grid */}
					<div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
						<BentoCard
							variant="highlight"
							title="Total commandes"
							value={counts.total}
							icon={Package}
						/>
						<BentoCard
							variant="stat"
							title="En attente"
							value={counts.pending}
							icon={Clock}
							iconColor="text-yellow-600"
							iconBgColor="bg-yellow-100"
						/>
						<BentoCard
							variant="stat"
							title="En traitement"
							value={counts.processing}
							icon={Package}
							iconColor="text-blue-600"
							iconBgColor="bg-blue-100"
						/>
						<BentoCard
							variant="stat"
							title="Expédiées"
							value={counts.shipped}
							icon={Truck}
							iconColor="text-purple-600"
							iconBgColor="bg-purple-100"
						/>
						<BentoCard
							variant="stat"
							title="Livrées"
							value={counts.delivered}
							icon={PackageCheck}
							iconColor="text-green-600"
							iconBgColor="bg-green-100"
						/>
					</div>

					{/* Table bento card */}
					<BentoCard variant="table">
						<div className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
							<div className="flex flex-wrap items-center gap-3">
								<Select value={statusFilter} onValueChange={setStatusFilter}>
									<SelectTrigger className="h-9 w-[170px]">
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
								searchKey="id"
								searchPlaceholder="Rechercher par N° commande ou client..."
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
