import { useState } from 'react'
import { useSearchParams, Link } from 'react-router'
import {
	Button,
	Badge,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@retrouve-ci/ui/components'
import { TopBar } from '@/shared/components/topbar'
import { BentoCard } from '@/shared/components/bento-card'
import { DataTable } from '@/shared/components/data-table'
import { DateRangePicker } from '@/shared/components/date-range-picker'
import { QrStatsGrid } from './components/qr-stats-grid'
import { qrLoader } from './servers/qr.loader'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import type { DateRange } from 'react-day-picker'
import type { ColumnDef } from '@tanstack/react-table'
import type { QrToken } from './qr.types'
import type { Route } from './+types/index'
import {
	MoreHorizontal,
	Eye,
	Copy,
	Link as LinkIcon,
	Ban,
	Download,
	Plus,
} from 'lucide-react'

export const loader = qrLoader

const STATUS_LABEL: Record<string, string> = {
	generated: 'Généré',
	activated: 'Activé',
	revoked: 'Révoqué',
}

const STATUS_CLASS: Record<string, string> = {
	activated: 'bg-green-100 text-green-700 hover:bg-green-100',
	generated: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
	revoked: 'bg-red-100 text-red-700 hover:bg-red-100',
}

export default function QrCodesPage({ loaderData }: Route.ComponentProps) {
	const { tokens, statusFilter } = loaderData
	const [searchParams, setSearchParams] = useSearchParams()
	const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

	const batches = [...new Set(tokens.map(t => t.batch).filter(Boolean))]
	const [batchFilter, setBatchFilter] = useState('all')

	const totalActivated = tokens.filter(t => t.status === 'activated').length
	const totalRevoked = tokens.filter(t => t.status === 'revoked').length

	let filtered = tokens
	if (batchFilter !== 'all') filtered = filtered.filter(t => t.batch === batchFilter)
	if (dateRange?.from) {
		filtered = filtered.filter(t => {
			const d = new Date(t.createdAt)
			return d >= dateRange.from! && (!dateRange.to || d <= dateRange.to)
		})
	}

	const handleStatusFilterChange = (value: string) => {
		const next = new URLSearchParams(searchParams)
		if (value === 'all') {
			next.delete('status')
		} else {
			next.set('status', value)
		}
		setSearchParams(next)
	}

	const copyToClipboard = (text: string, label: string) => {
		navigator.clipboard.writeText(text).catch(() => null)
		toast.success(`${label} copié`)
	}

	const handleExportCSV = () => {
		const headers = ['Token', 'Statut', 'Batch', 'Label', 'Créé le', 'Activé le']
		const rows = filtered.map(t => [
			t.code,
			STATUS_LABEL[t.status] ?? t.status,
			t.batch ?? '-',
			t.label ?? '-',
			format(new Date(t.createdAt), 'dd/MM/yyyy', { locale: fr }),
			t.activatedAt ? format(new Date(t.activatedAt), 'dd/MM/yyyy', { locale: fr }) : '-',
		])
		const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
		const blob = new Blob([csv], { type: 'text/csv' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = 'qr-tokens.csv'
		a.click()
		URL.revokeObjectURL(url)
		toast.success('Export CSV téléchargé')
	}

	const columns: ColumnDef<QrToken>[] = [
		{
			accessorKey: 'code',
			header: 'Token',
			cell: ({ row }) => (
				<span className="font-mono text-xs">{row.original.code}</span>
			),
		},
		{
			accessorKey: 'status',
			header: 'Statut',
			cell: ({ row }) => (
				<Badge className={STATUS_CLASS[row.original.status] ?? ''}>
					{STATUS_LABEL[row.original.status] ?? row.original.status}
				</Badge>
			),
		},
		{
			accessorKey: 'batch',
			header: 'Batch',
			cell: ({ row }) => (
				<span className="text-muted-foreground text-sm">
					{row.original.batch ?? '-'}
				</span>
			),
		},
		{
			accessorKey: 'createdAt',
			header: 'Créé le',
			cell: ({ row }) =>
				format(new Date(row.original.createdAt), 'dd MMM yyyy', { locale: fr }),
		},
		{
			accessorKey: 'activatedAt',
			header: 'Activé le',
			cell: ({ row }) =>
				row.original.activatedAt
					? format(new Date(row.original.activatedAt), 'dd MMM yyyy', { locale: fr })
					: '-',
		},
		{
			accessorKey: 'userId',
			header: 'Utilisateur',
			cell: ({ row }) =>
				row.original.userId ? (
					<Link
						to={`/users/${row.original.userId}`}
						className="text-primary text-sm hover:underline"
					>
						Voir
					</Link>
				) : (
					<span className="text-muted-foreground">-</span>
				),
		},
		{
			id: 'actions',
			header: 'Actions',
			cell: ({ row }) => (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon" className="h-8 w-8">
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem asChild>
							<Link to={`/qr/${row.original.code}`}>
								<Eye className="mr-2 h-4 w-4" /> Voir détails
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => copyToClipboard(row.original.code, 'Token')}
						>
							<Copy className="mr-2 h-4 w-4" /> Copier le token
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() =>
								copyToClipboard(
									`${import.meta.env.VITE_API_URL?.replace(':3002', ':3000') ?? 'https://retrouveci.com'}/q/${row.original.code}`,
									'Lien',
								)
							}
						>
							<LinkIcon className="mr-2 h-4 w-4" /> Copier le lien
						</DropdownMenuItem>
						{row.original.status !== 'revoked' && (
							<>
								<DropdownMenuSeparator />
								<DropdownMenuItem asChild>
									<Link
										to={`/qr/${row.original.code}`}
										className="text-destructive focus:text-destructive"
									>
										<Ban className="mr-2 h-4 w-4" /> Révoquer
									</Link>
								</DropdownMenuItem>
							</>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			),
		},
	]

	return (
		<>
			<TopBar title="Stickers / QR Codes" />
			<div className="pt-16">
				<div className="space-y-4 p-4 lg:p-6">
					<QrStatsGrid
						total={tokens.length}
						activated={totalActivated}
						revoked={totalRevoked}
					/>

					<BentoCard variant="table">
						<div className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
							<div className="flex flex-wrap items-center gap-3">
								<Select value={statusFilter} onValueChange={handleStatusFilterChange}>
									<SelectTrigger className="h-9 w-36">
										<SelectValue placeholder="Statut" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">Tous statuts</SelectItem>
										<SelectItem value="activated">Activé</SelectItem>
										<SelectItem value="generated">Généré</SelectItem>
										<SelectItem value="revoked">Révoqué</SelectItem>
									</SelectContent>
								</Select>
								<Select value={batchFilter} onValueChange={setBatchFilter}>
									<SelectTrigger className="h-9 w-40">
										<SelectValue placeholder="Batch" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">Tous les batchs</SelectItem>
										{batches.map(batch => (
											<SelectItem key={batch!} value={batch!}>
												{batch}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<DateRangePicker
									dateRange={dateRange}
									onDateRangeChange={setDateRange}
								/>
							</div>
							<div className="flex gap-2">
								<Button variant="outline" size="sm" onClick={handleExportCSV}>
									<Download className="mr-2 h-4 w-4" /> Exporter CSV
								</Button>
								<Button size="sm" asChild>
									<Link to="/qr/generate">
										<Plus className="mr-2 h-4 w-4" /> Générer
									</Link>
								</Button>
							</div>
						</div>
						<div className="p-4">
							<DataTable
								columns={columns}
								data={filtered}
								searchKey="code"
								searchPlaceholder="Rechercher par token..."
							/>
						</div>
					</BentoCard>
				</div>
			</div>
		</>
	)
}
