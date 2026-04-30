import { type DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { X, MapPin, Calendar, SlidersHorizontal } from 'lucide-react'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@retrouve-ci/ui/components/ui/select'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@retrouve-ci/ui/components/ui/popover'
import { Calendar as CalendarComponent } from '@retrouve-ci/ui/components/ui/calendar'
import { CI_VILLES, ABIDJAN_COMMUNES } from '@/lib/ci-locations'
import { cn } from '@retrouve-ci/ui/lib/utils'

interface FilterPanelProps {
	filterVille: string
	filterCommune: string
	dateRange: DateRange | undefined
	activeFiltersCount: number
	onVilleChange: (value: string) => void
	onCommuneChange: (value: string) => void
	onDateChange: (range: DateRange | undefined) => void
	onReset: () => void
}

export function FilterPanel({
	filterVille,
	filterCommune,
	dateRange,
	activeFiltersCount,
	onVilleChange,
	onCommuneChange,
	onDateChange,
	onReset,
}: FilterPanelProps) {
	return (
		<div className="mb-5 rounded-2xl border-2 border-dashed border-(--primary-green)/20 bg-(--primary-green)/3 p-5">
			<div className="mb-4 flex items-center justify-between">
				<p className="flex items-center gap-2 text-sm font-semibold">
					<SlidersHorizontal className="h-4 w-4 text-(--primary-green)" />
					Filtres avancés
				</p>
				{activeFiltersCount > 0 && (
					<button
						onClick={onReset}
						className="text-muted-foreground hover:text-destructive flex items-center gap-1 text-xs transition-colors"
					>
						<X className="h-3 w-3" />
						Réinitialiser tout
					</button>
				)}
			</div>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				<div className="space-y-1.5">
					<label className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
						<MapPin className="h-3 w-3" />
						Ville
					</label>
					<Select value={filterVille} onValueChange={onVilleChange}>
						<SelectTrigger className="bg-background h-10 rounded-xl text-sm">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Toutes les villes</SelectItem>
							{CI_VILLES.map(v => (
								<SelectItem key={v} value={v}>
									{v}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-1.5">
					<label className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
						<MapPin className="h-3 w-3" />
						Commune
					</label>
					<Select
						value={filterCommune}
						onValueChange={onCommuneChange}
						disabled={filterVille !== 'Abidjan'}
					>
						<SelectTrigger className="bg-background h-10 rounded-xl text-sm">
							<SelectValue
								placeholder={filterVille === 'Abidjan' ? 'Toutes' : '—'}
							/>
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Toutes les communes</SelectItem>
							{ABIDJAN_COMMUNES.map(c => (
								<SelectItem key={c} value={c}>
									{c}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-1.5">
					<label className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
						<Calendar className="h-3 w-3" />
						Période
					</label>
					<Popover>
						<PopoverTrigger asChild>
							<button
								className={cn(
									'bg-background hover:bg-muted/50 flex h-10 w-full items-center gap-2 rounded-xl border px-3 text-sm transition-colors',
									dateRange?.from ? 'text-foreground' : 'text-muted-foreground',
								)}
							>
								<Calendar className="h-3.5 w-3.5 shrink-0" />
								<span className="flex-1 truncate text-left">
									{dateRange?.from
										? dateRange.to
											? `${format(dateRange.from, 'd MMM', { locale: fr })} — ${format(dateRange.to, 'd MMM yyyy', { locale: fr })}`
											: `À partir du ${format(dateRange.from, 'd MMM yyyy', { locale: fr })}`
										: 'Sélectionner une période'}
								</span>
								{dateRange?.from && (
									<X
										className="text-muted-foreground hover:text-foreground h-3 w-3 shrink-0"
										onClick={e => {
											e.stopPropagation()
											onDateChange(undefined)
										}}
									/>
								)}
							</button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0" align="start">
							<CalendarComponent
								mode="range"
								selected={dateRange}
								onSelect={onDateChange}
								disabled={{ after: new Date() }}
								locale={fr}
								numberOfMonths={1}
							/>
						</PopoverContent>
					</Popover>
				</div>
			</div>
		</div>
	)
}
