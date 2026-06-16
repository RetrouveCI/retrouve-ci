import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import {
	Avatar,
	AvatarFallback,
	Badge,
	Button,
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
import { UsersStatsGrid } from './components/users-stats-grid'
import { usersLoader } from './servers/users.loader'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import { Eye, Download, QrCode, FileText } from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import type { ColumnDef } from '@tanstack/react-table'
import type { User } from './users.types'
import type { Route } from './+types/index'

export const loader = usersLoader

export default function UsersPage({ loaderData }: Route.ComponentProps) {
	const { users, total, statusFilter } = loaderData
	const [searchParams, setSearchParams] = useSearchParams()
	const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

	const handleStatusFilter = (value: string) => {
		const next = new URLSearchParams(searchParams)
		if (value === 'all') next.delete('status')
		else next.set('status', value)
		setSearchParams(next)
	}

	let filtered = users
	if (dateRange?.from) {
		filtered = filtered.filter((u) => {
			const d = new Date(u.createdAt)
			return d >= dateRange.from! && (!dateRange.to || d <= dateRange.to)
		})
	}

	const active = users.filter((u) => u.status === 'active').length
	const inactive = users.filter((u) => u.status === 'inactive').length

	const handleExportCSV = () => {
		const headers = ['ID', 'Nom', 'Email', 'Téléphone', 'Statut', 'QR Codes', 'Posts', "Date d'inscription"]
		const rows = filtered.map((u) => [
			u.id,
			u.name,
			u.email,
			u.phone,
			u.status === 'active' ? 'Actif' : 'Inactif',
			u.qrCodesCount,
			u.postsCount,
			format(new Date(u.createdAt), 'dd/MM/yyyy', { locale: fr }),
		])
		const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
		const blob = new Blob([csv], { type: 'text/csv' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = 'utilisateurs.csv'
		a.click()
		URL.revokeObjectURL(url)
		toast.success('Export CSV téléchargé')
	}

	const columns: ColumnDef<User>[] = [
		{
			accessorKey: 'name',
			header: 'Utilisateur',
			cell: ({ row }) => (
				<div className="flex items-center gap-3">
					<Avatar className="h-8 w-8">
						<AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
							{row.original.name.charAt(0)}
						</AvatarFallback>
					</Avatar>
					<div>
						<p className="text-sm font-medium">{row.original.name}</p>
						<p className="text-muted-foreground text-xs">{row.original.email}</p>
					</div>
				</div>
			),
		},
		{
			accessorKey: 'phone',
			header: 'Téléphone',
			cell: ({ row }) => (
				<span className="font-mono text-sm">{row.original.phone}</span>
			),
		},
		{
			accessorKey: 'qrCodesCount',
			header: 'QR Codes',
			cell: ({ row }) => (
				<div className="flex items-center gap-1.5">
					<QrCode className="text-muted-foreground h-3.5 w-3.5" />
					<span className="font-semibold">{row.original.qrCodesCount}</span>
				</div>
			),
		},
		{
			accessorKey: 'postsCount',
			header: 'Posts',
			cell: ({ row }) => (
				<div className="flex items-center gap-1.5">
					<FileText className="text-muted-foreground h-3.5 w-3.5" />
					<span className="font-semibold">{row.original.postsCount}</span>
				</div>
			),
		},
		{
			accessorKey: 'createdAt',
			header: 'Inscription',
			cell: ({ row }) =>
				format(new Date(row.original.createdAt), 'dd MMM yyyy', { locale: fr }),
		},
		{
			accessorKey: 'status',
			header: 'Statut',
			cell: ({ row }) => (
				<Badge
					className={
						row.original.status === 'active'
							? 'bg-green-100 text-green-700 hover:bg-green-100'
							: 'bg-gray-100 text-gray-600 hover:bg-gray-100'
					}
				>
					{row.original.status === 'active' ? 'Actif' : 'Inactif'}
				</Badge>
			),
		},
		{
			id: 'actions',
			header: 'Actions',
			cell: ({ row }) => (
				<Button variant="ghost" size="icon" className="h-8 w-8" asChild>
					<Link to={`/users/${row.original.id}`}>
						<Eye className="h-4 w-4" />
					</Link>
				</Button>
			),
		},
	]

	return (
		<>
			<TopBar title="Utilisateurs" />
			<div className="pt-16">
				<div className="space-y-4 p-4 lg:p-6">
					<UsersStatsGrid total={total} active={active} inactive={inactive} />

					<BentoCard variant="table">
						<div className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
							<div className="flex flex-wrap items-center gap-3">
								<Select value={statusFilter} onValueChange={handleStatusFilter}>
									<SelectTrigger className="h-9 w-40">
										<SelectValue placeholder="Statut" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">Tous</SelectItem>
										<SelectItem value="active">Actifs</SelectItem>
										<SelectItem value="inactive">Inactifs</SelectItem>
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
								data={filtered}
								searchKey="name"
								searchPlaceholder="Rechercher par nom, email..."
							/>
						</div>
					</BentoCard>
				</div>
			</div>
		</>
	)
}
