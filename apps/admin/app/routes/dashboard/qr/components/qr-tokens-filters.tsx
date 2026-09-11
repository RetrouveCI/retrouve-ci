import { Link } from 'react-router'
import { Button } from '@app/ui/components'
import { QR_TOKEN_STATUSES } from '@app/contracts/qr-codes'
import { Download, Plus } from 'lucide-react'
import { DensityToggle } from '@/components/density-toggle'
import { ListToolbar } from '@/components/list-toolbar'
import type { StatusCounts } from '@/shared/helpers/list-counts'
import type { QrTokenStatus } from '../types/qr.types'

const STATUS_LABELS: Record<QrTokenStatus, string> = {
	generated: 'Générés',
	activated: 'Activés',
	revoked: 'Révoqués',
}

interface QrTokensFiltersProps {
	counts: StatusCounts<QrTokenStatus> | null
	onExportCSV: () => void
}

export function QrTokensFilters({ counts, onExportCSV }: QrTokensFiltersProps) {
	return (
		<ListToolbar
			chips={[
				{ value: 'all', label: 'Tous', count: counts?.all },
				...QR_TOKEN_STATUSES.map(status => ({
					value: status,
					label: STATUS_LABELS[status],
					count: counts?.[status],
				})),
			]}
			searchPlaceholder="Code, libellé, lot…"
		>
			<DensityToggle />
			<Button variant="outline" size="sm" onClick={onExportCSV}>
				<Download className="mr-2 h-4 w-4" /> Exporter la page
			</Button>
			<Button size="sm" asChild>
				<Link to="/qr/generate">
					<Plus className="mr-2 h-4 w-4" /> Générer
				</Link>
			</Button>
		</ListToolbar>
	)
}
