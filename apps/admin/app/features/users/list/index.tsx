import { useEffect, useState } from 'react'
import { useFetcher, useRevalidator, useSearchParams } from 'react-router'
import { TopBar } from '@/shared/components/topbar'
import { BentoCard } from '@/shared/components/bento-card'
import { UsersStatsGrid } from './components/users-stats-grid'
import { UsersFilters } from './components/users-filters'
import { UsersTable } from './components/users-table'
import { usersLoader } from './servers/users.loader'
import { usersAction } from '../servers/users.action'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import type { DateRange } from 'react-day-picker'
import type { User } from '../users.types'
import type { Route } from './+types/index'

export const loader = usersLoader
export const action = usersAction

interface ActionResult {
	ok: boolean
	intent?: string
	error?: string
}

export default function UsersPage({ loaderData }: Route.ComponentProps) {
	const { users, total, statusFilter } = loaderData
	const revalidator = useRevalidator()
	const [searchParams, setSearchParams] = useSearchParams()
	const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
	const fetcher = useFetcher<ActionResult>()

	useEffect(() => {
		if (fetcher.state !== 'idle' || !fetcher.data) return
		if (fetcher.data.ok) {
			toast.success(
				fetcher.data.intent === 'ban' ? 'Compte désactivé' : 'Compte activé',
			)
			revalidator.revalidate()
		} else if (fetcher.data.error) {
			toast.error(fetcher.data.error)
		}
	}, [fetcher.state, fetcher.data, revalidator])

	const handleStatusFilter = (value: string) => {
		const next = new URLSearchParams(searchParams)
		if (value === 'all') next.delete('status')
		else next.set('status', value)
		setSearchParams(next)
	}

	const handleToggleBan = (user: User) => {
		fetcher.submit(
			{ intent: user.status === 'active' ? 'ban' : 'unban', userId: user.id },
			{ method: 'post' },
		)
	}

	let filtered = users
	if (dateRange?.from) {
		filtered = filtered.filter(u => {
			const d = new Date(u.createdAt)
			return d >= dateRange.from! && (!dateRange.to || d <= dateRange.to)
		})
	}

	const active = users.filter(u => u.status === 'active').length
	const inactive = users.filter(u => u.status === 'inactive').length

	const handleExportCSV = () => {
		const headers = ['ID', 'Nom', 'Email', 'Téléphone', 'Statut', "Date d'inscription"]
		const rows = filtered.map(u => [
			u.id,
			u.name,
			u.email,
			u.phone ?? '',
			u.status === 'active' ? 'Actif' : 'Inactif',
			format(new Date(u.createdAt), 'dd/MM/yyyy', { locale: fr }),
		])
		const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
		const blob = new Blob([csv], { type: 'text/csv' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = 'utilisateurs.csv'
		a.click()
		URL.revokeObjectURL(url)
		toast.success('Export CSV téléchargé')
	}

	return (
		<>
			<TopBar title="Utilisateurs" />
			<div className="pt-16">
				<div className="space-y-4 p-4 lg:p-6">
					<UsersStatsGrid total={total} active={active} inactive={inactive} />
					<BentoCard variant="table">
						<UsersFilters
							statusFilter={statusFilter}
							dateRange={dateRange}
							onStatusFilterChange={handleStatusFilter}
							onDateRangeChange={setDateRange}
							onExportCSV={handleExportCSV}
						/>
						<div className="p-4">
							<UsersTable
								data={filtered}
								onToggleBan={handleToggleBan}
								isBusy={fetcher.state !== 'idle'}
							/>
						</div>
					</BentoCard>
				</div>
			</div>
		</>
	)
}
