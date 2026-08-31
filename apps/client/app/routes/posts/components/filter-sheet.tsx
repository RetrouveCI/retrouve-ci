import { useEffect, useRef, useState } from 'react'
import {
	Button,
	Calendar as CalendarComponent,
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	Label,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@app/ui/components'
import { type DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@app/ui/utils'
import { ABIDJAN_COMMUNES, CI_VILLES } from '@/shared/constants/locations'
import type { LostItemCategory, LostItemType } from '@/shared/types/lost-item'
import type { DateFilterMode } from '../helpers/date-presets'
import { CATEGORY_FILTERS, TYPE_FILTERS } from '../posts.const'
import { FilterPill } from './filter-pill'

interface FilterSheetProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	activeType: LostItemType | 'all'
	activeCategory: LostItemCategory | 'all'
	filterVille: string
	filterCommune: string
	dateFilter: DateFilterMode
	dateRange: DateRange | undefined
	hasActiveFilters: boolean
	resultCount: number
	onTypeChange: (value: LostItemType | 'all') => void
	onCategoryChange: (value: LostItemCategory | 'all') => void
	onVilleChange: (value: string) => void
	onCommuneChange: (value: string) => void
	onDateFilterChange: (mode: DateFilterMode) => void
	onDateRangeChange: (range: DateRange | undefined) => void
	onReset: () => void
	onCancel: () => void
}

/**
 * The five filters in a bottom sheet (§2.1). Inline, the panel pushed the
 * results it was meant to narrow off the screen — worst on the phone it was
 * being used from, where opening it cost most of the fold.
 *
 * Changes apply live, because « Voir N résultats » cannot count a filter that
 * has not run yet; « Annuler » is what restores the URL the sheet opened on.
 */
export function FilterSheet({
	open,
	onOpenChange,
	activeType,
	activeCategory,
	filterVille,
	filterCommune,
	dateFilter,
	dateRange,
	hasActiveFilters,
	resultCount,
	onTypeChange,
	onCategoryChange,
	onVilleChange,
	onCommuneChange,
	onDateFilterChange,
	onDateRangeChange,
	onReset,
	onCancel,
}: FilterSheetProps) {
	const [showCalendar, setShowCalendar] = useState(false)
	const isCustomPeriod = dateFilter === 'custom'
	const calendarRef = useRef<HTMLDivElement>(null)

	// The calendar opens below the fold of a phone-height sheet, so revealing it
	// is part of opening it.
	useEffect(() => {
		if (showCalendar) calendarRef.current?.scrollIntoView({ block: 'nearest' })
	}, [showCalendar])

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			{/**
			 * Above `lg` the sheet stops spanning the window: measured at 1280 px it
			 * stretched « Annuler » to 484 px, which reads as a wall rather than as
			 * the panel §2.1 describes. Below that, full width is right — it is the
			 * phone and the tablet the sheet was drawn for.
			 */}
			<DrawerContent className="lg:mx-auto lg:max-w-2xl lg:rounded-t-2xl">
				<DrawerHeader className="flex flex-row items-center justify-between border-b px-4 pt-2 pb-3.5 text-left">
					<DrawerTitle className="text-[17px] tracking-tight">
						Filtres
					</DrawerTitle>
					<DrawerDescription className="sr-only">
						Affinez les annonces par type, catégorie, lieu et période.
					</DrawerDescription>
					<button
						type="button"
						onClick={onReset}
						disabled={!hasActiveFilters}
						className="text-muted-foreground enabled:hover:text-foreground touch-target text-[13px] font-medium transition-colors disabled:opacity-40"
					>
						Réinitialiser
					</button>
				</DrawerHeader>

				<div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-4.5">
					<fieldset>
						<legend className="mb-2 text-[13px] font-semibold">
							Type d&apos;annonce
						</legend>
						<div className="flex flex-wrap gap-2">
							{TYPE_FILTERS.map(({ id, label, dotClassName }) => (
								<FilterPill
									key={id}
									active={activeType === id}
									onClick={() => onTypeChange(id)}
								>
									{dotClassName && (
										<span
											className={cn('h-1.5 w-1.5 rounded-full', dotClassName)}
										/>
									)}
									{label}
								</FilterPill>
							))}
						</div>
					</fieldset>

					<fieldset>
						<legend className="mb-2 text-[13px] font-semibold">
							Catégorie
						</legend>
						<div className="flex flex-wrap gap-2">
							{CATEGORY_FILTERS.map(({ id, label }) => (
								<FilterPill
									key={id}
									active={activeCategory === id}
									onClick={() => onCategoryChange(id)}
								>
									{label}
								</FilterPill>
							))}
						</div>
					</fieldset>

					<div>
						<Label htmlFor="filter-ville" className="mb-2 text-[13px]">
							Ville
						</Label>
						<Select value={filterVille} onValueChange={onVilleChange}>
							<SelectTrigger
								id="filter-ville"
								className="bg-background h-13 w-full rounded-xl border-[1.5px] text-[15px]"
							>
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

					<div>
						<Label htmlFor="filter-commune" className="mb-2 text-[13px]">
							Commune
						</Label>
						<Select
							value={filterCommune}
							onValueChange={onCommuneChange}
							disabled={filterVille !== 'Abidjan'}
						>
							<SelectTrigger
								id="filter-commune"
								className="bg-background h-13 w-full rounded-xl border-[1.5px] text-[15px]"
							>
								<SelectValue
									placeholder={
										filterVille === 'Abidjan'
											? 'Toutes les communes'
											: 'Choisissez Abidjan'
									}
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

					<fieldset>
						<legend className="mb-2 text-[13px] font-semibold">Période</legend>
						<div className="flex flex-wrap gap-2">
							<FilterPill
								active={dateFilter === '7d'}
								onClick={() => {
									setShowCalendar(false)
									onDateFilterChange('7d')
								}}
							>
								7 jours
							</FilterPill>
							<FilterPill
								active={dateFilter === '30d'}
								onClick={() => {
									setShowCalendar(false)
									onDateFilterChange('30d')
								}}
							>
								30 jours
							</FilterPill>
							<FilterPill
								active={dateFilter === 'all'}
								onClick={() => {
									setShowCalendar(false)
									onDateFilterChange('all')
								}}
							>
								Tout
							</FilterPill>
							{/**
							 * The clear cross used to live *inside* this control, one button
							 * nested in another. « Tout » is the clear now, so the nesting is
							 * gone rather than worked around.
							 */}
							<FilterPill
								active={isCustomPeriod}
								onClick={() => setShowCalendar(v => !v)}
								aria-expanded={showCalendar || isCustomPeriod}
							>
								{isCustomPeriod && dateRange?.from
									? dateRange.to
										? `${format(dateRange.from, 'd MMM', { locale: fr })} — ${format(dateRange.to, 'd MMM yyyy', { locale: fr })}`
										: format(dateRange.from, 'd MMM yyyy', { locale: fr })
									: 'Dates…'}
							</FilterPill>
						</div>

						{(showCalendar || isCustomPeriod) && (
							<div
								ref={calendarRef}
								className="mt-3 flex justify-center rounded-xl border p-1"
							>
								<CalendarComponent
									mode="range"
									selected={dateRange}
									onSelect={onDateRangeChange}
									disabled={{ after: new Date() }}
									locale={fr}
									numberOfMonths={1}
								/>
							</div>
						)}
					</fieldset>
				</div>

				<DrawerFooter
					className="flex-row gap-3 border-t px-4 pt-3"
					style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}
				>
					<Button
						type="button"
						variant="outline"
						onClick={onCancel}
						className="h-13 flex-1 rounded-[14px] border-[1.5px] text-[15px] font-semibold"
					>
						Annuler
					</Button>
					<Button
						type="button"
						onClick={() => onOpenChange(false)}
						className="bg-primary-green hover:bg-primary-green-dark h-13 flex-[1.6] rounded-[14px] text-[15px] font-semibold text-white"
					>
						Voir {resultCount} résultat{resultCount > 1 ? 's' : ''}
					</Button>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	)
}
