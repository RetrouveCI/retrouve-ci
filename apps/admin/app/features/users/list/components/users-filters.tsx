import {
	Button,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@retrouve-ci/ui/components'
import { DateRangePicker } from '@/shared/components/date-range-picker'
import { Download } from 'lucide-react'
import type { DateRange } from 'react-day-picker'

interface UsersFiltersProps {
	statusFilter: string
	dateRange: DateRange | undefined
	onStatusFilterChange: (value: string) => void
	onDateRangeChange: (range: DateRange | undefined) => void
	onExportCSV: () => void
}

export function UsersFilters({
	statusFilter,
	dateRange,
	onStatusFilterChange,
	onDateRangeChange,
	onExportCSV,
}: UsersFiltersProps) {
	return (
		<div className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex flex-wrap items-center gap-3">
				<Select value={statusFilter} onValueChange={onStatusFilterChange}>
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
					onDateRangeChange={onDateRangeChange}
				/>
			</div>
			<Button variant="outline" size="sm" onClick={onExportCSV}>
				<Download className="mr-2 h-4 w-4" /> Exporter CSV
			</Button>
		</div>
	)
}
