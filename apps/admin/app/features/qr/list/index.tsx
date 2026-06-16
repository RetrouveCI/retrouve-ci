import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { TopBar } from '@/shared/components/topbar'
import { BentoCard } from '@/shared/components/bento-card'
import { QrStatsGrid } from './components/qr-stats-grid'
import { QrTokensFilters } from './components/qr-tokens-filters'
import { QrTokensTable } from './components/qr-tokens-table'
import { qrLoader } from './servers/qr.loader'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import type { DateRange } from 'react-day-picker'
import type { Route } from './+types/index'

export const loader = qrLoader

export default function QrCodesPage({ loaderData }: Route.ComponentProps) {
	const { tokens, statusFilter } = loaderData
	const [searchParams, setSearchParams] = useSearchParams()
	const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
	const [batchFilter, setBatchFilter] = useState('all')

	const batches = [
		...new Set(tokens.map(t => t.batch).filter(Boolean)),
	] as string[]

	const totalActivated = tokens.filter(t => t.status === 'activated').length
	const totalRevoked = tokens.filter(t => t.status === 'revoked').length

	let filtered = tokens
	if (batchFilter !== 'all')
		filtered = filtered.filter(t => t.batch === batchFilter)
	if (dateRange?.from) {
		filtered = filtered.filter(t => {
			const d = new Date(t.createdAt)
			return d >= dateRange.from! && (!dateRange.to || d <= dateRange.to)
		})
	}

	const handleStatusFilterChange = (value: string) => {
		const next = new URLSearchParams(searchParams)
		if (value === 'all') next.delete('status')
		else next.set('status', value)
		setSearchParams(next)
	}

	const copyToClipboard = (text: string, label: string) => {
		navigator.clipboard.writeText(text).catch(() => null)
		toast.success(`${label} copié`)
	}

	const handleExportCSV = () => {
		const headers = [
			'Token',
			'Statut',
			'Batch',
			'Label',
			'Créé le',
			'Activé le',
		]
		const rows = filtered.map(t => [
			t.code,
			t.status,
			t.batch ?? '-',
			t.label ?? '-',
			format(new Date(t.createdAt), 'dd/MM/yyyy', { locale: fr }),
			t.activatedAt
				? format(new Date(t.activatedAt), 'dd/MM/yyyy', { locale: fr })
				: '-',
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
						<QrTokensFilters
							statusFilter={statusFilter}
							batchFilter={batchFilter}
							batches={batches}
							dateRange={dateRange}
							onStatusFilterChange={handleStatusFilterChange}
							onBatchFilterChange={setBatchFilter}
							onDateRangeChange={setDateRange}
							onExportCSV={handleExportCSV}
						/>
						<div className="p-4">
							<QrTokensTable data={filtered} onCopy={copyToClipboard} />
						</div>
					</BentoCard>
				</div>
			</div>
		</>
	)
}
