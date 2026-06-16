import { Link } from 'react-router'
import {
	Button,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@retrouve-ci/ui/components'
import { DateRangePicker } from '@/shared/components/date-range-picker'
import { Download, Plus } from 'lucide-react'
import type { DateRange } from 'react-day-picker'

interface QrTokensFiltersProps {
	statusFilter: string
	batchFilter: string
	batches: string[]
	dateRange: DateRange | undefined
	onStatusFilterChange: (value: string) => void
	onBatchFilterChange: (value: string) => void
	onDateRangeChange: (range: DateRange | undefined) => void
	onExportCSV: () => void
}

export function QrTokensFilters({
	statusFilter,
	batchFilter,
	batches,
	dateRange,
	onStatusFilterChange,
	onBatchFilterChange,
	onDateRangeChange,
	onExportCSV,
}: QrTokensFiltersProps) {
	return (
		<div className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex flex-wrap items-center gap-3">
				<Select value={statusFilter} onValueChange={onStatusFilterChange}>
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
				<Select value={batchFilter} onValueChange={onBatchFilterChange}>
					<SelectTrigger className="h-9 w-40">
						<SelectValue placeholder="Batch" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Tous les batchs</SelectItem>
						{batches.map(batch => (
							<SelectItem key={batch} value={batch}>
								{batch}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<DateRangePicker
					dateRange={dateRange}
					onDateRangeChange={onDateRangeChange}
				/>
			</div>
			<div className="flex gap-2">
				<Button variant="outline" size="sm" onClick={onExportCSV}>
					<Download className="mr-2 h-4 w-4" /> Exporter CSV
				</Button>
				<Button size="sm" asChild>
					<Link to="/qr/generate">
						<Plus className="mr-2 h-4 w-4" /> Générer
					</Link>
				</Button>
			</div>
		</div>
	)
}
