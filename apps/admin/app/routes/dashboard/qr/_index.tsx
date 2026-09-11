import { BentoCard } from '@/components/bento-card'
import { QrStatsGrid } from './components/qr-stats-grid'
import { QrTokensFilters } from './components/qr-tokens-filters'
import { QrTokensTable } from './components/qr-tokens-table'
import { qrLoader } from './servers/qr.loader'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import type { RouteHandle } from '@/shared/helpers/page-meta'
import type { Route } from './+types/_index'

export const loader = qrLoader

export const handle: RouteHandle = { title: 'Stickers & QR' }

export default function QrCodesPage({ loaderData }: Route.ComponentProps) {
	const { tokens, total, page, pageSize, counts } = loaderData

	const copyToClipboard = (text: string, label: string) => {
		navigator.clipboard.writeText(text).catch(() => null)
		toast.success(`${label} copié`)
	}

	// The page on screen, and said so: the list is paged on the server now.
	const handleExportCSV = () => {
		const headers = [
			'Token',
			'Statut',
			'Batch',
			'Label',
			'Créé le',
			'Activé le',
		]
		const rows = tokens.map(t => [
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
		a.download = `qr-tokens-page-${page}.csv`
		a.click()
		URL.revokeObjectURL(url)
		toast.success('Export CSV téléchargé')
	}

	return (
		<div className="space-y-4 p-4 lg:p-6">
			{counts && (
				<QrStatsGrid
					total={counts.all ?? 0}
					activated={counts.activated ?? 0}
					revoked={counts.revoked ?? 0}
				/>
			)}
			<BentoCard variant="table">
				<QrTokensFilters counts={counts} onExportCSV={handleExportCSV} />
				<div className="p-4">
					<QrTokensTable
						data={tokens}
						onCopy={copyToClipboard}
						pagination={{ page, pageSize, total }}
					/>
				</div>
			</BentoCard>
		</div>
	)
}
