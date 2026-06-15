'use client'

import {
	Button,
	Calendar,
	Popover,
	PopoverContent,
	PopoverTrigger,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Badge,
	Separator,
	Label,
} from '@retrouve-ci/ui/components'
import * as React from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Calendar as CalendarIcon, Filter, X } from 'lucide-react'
import type { DateRange } from 'react-day-picker'

import { cn } from '@retrouve-ci/ui/utils'
export interface PostsFilterState {
	status: string
	type: string
	location: string
	dateRange: DateRange | undefined
}

interface PostsFilterProps {
	filters: PostsFilterState
	onFiltersChange: (filters: PostsFilterState) => void
	locations: string[]
	className?: string
}

export function PostsFilter({
	filters,
	onFiltersChange,
	locations,
	className,
}: PostsFilterProps) {
	const [open, setOpen] = React.useState(false)
	const [datePreset, setDatePreset] = React.useState<string>('all')

	const activeFiltersCount = [
		filters.status !== 'all',
		filters.type !== 'all',
		filters.location !== 'all',
		filters.dateRange !== undefined,
	].filter(Boolean).length

	const handlePresetChange = (value: string) => {
		setDatePreset(value)
		const today = new Date()
		let from: Date | undefined
		let to: Date | undefined = today

		switch (value) {
			case 'today':
				from = today
				break
			case '7days':
				from = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
				break
			case '30days':
				from = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
				break
			case '90days':
				from = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)
				break
			case 'all':
				from = undefined
				to = undefined
				break
			default:
				from = undefined
				to = undefined
		}

		onFiltersChange({
			...filters,
			dateRange: from && to ? { from, to } : undefined,
		})
	}

	const handleCalendarChange = (range: DateRange | undefined) => {
		setDatePreset('custom')
		onFiltersChange({ ...filters, dateRange: range })
	}

	const handleReset = () => {
		setDatePreset('all')
		onFiltersChange({
			status: 'all',
			type: 'all',
			location: 'all',
			dateRange: undefined,
		})
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="outline" className={cn('gap-2', className)}>
					<Filter className="h-4 w-4" />
					Filtres
					{activeFiltersCount > 0 && (
						<Badge
							variant="secondary"
							className="ml-1 h-5 w-5 rounded-full p-0 text-xs"
						>
							{activeFiltersCount}
						</Badge>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-80" align="start">
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h4 className="font-medium">Filtres</h4>
						{activeFiltersCount > 0 && (
							<Button
								variant="ghost"
								size="sm"
								className="text-muted-foreground hover:text-foreground h-auto p-0"
								onClick={handleReset}
							>
								<X className="mr-1 h-3 w-3" />
								Réinitialiser
							</Button>
						)}
					</div>

					<Separator />

					<div className="space-y-2">
						<Label>Statut</Label>
						<Select
							value={filters.status}
							onValueChange={value =>
								onFiltersChange({ ...filters, status: value })
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Tous statuts" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Tous statuts</SelectItem>
								<SelectItem value="pending">En attente</SelectItem>
								<SelectItem value="published">Publié</SelectItem>
								<SelectItem value="hidden">Masqué</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label>Type</Label>
						<Select
							value={filters.type}
							onValueChange={value =>
								onFiltersChange({ ...filters, type: value })
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Tous types" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Tous types</SelectItem>
								<SelectItem value="lost">Perdu</SelectItem>
								<SelectItem value="found">Retrouvé</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label>Lieu</Label>
						<Select
							value={filters.location}
							onValueChange={value =>
								onFiltersChange({ ...filters, location: value })
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Tous lieux" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Tous lieux</SelectItem>
								{locations.map(location => (
									<SelectItem key={location} value={location}>
										{location}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<Separator />

					<div className="space-y-2">
						<Label>Période</Label>
						<Select value={datePreset} onValueChange={handlePresetChange}>
							<SelectTrigger>
								<SelectValue placeholder="Toute période" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Toute période</SelectItem>
								<SelectItem value="today">Aujourd&apos;hui</SelectItem>
								<SelectItem value="7days">7 derniers jours</SelectItem>
								<SelectItem value="30days">30 derniers jours</SelectItem>
								<SelectItem value="90days">90 derniers jours</SelectItem>
								<SelectItem value="custom">Personnalisé</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{(datePreset === 'custom' || filters.dateRange) && (
						<div className="space-y-2">
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className={cn(
											'w-full justify-start text-left font-normal',
											!filters.dateRange && 'text-muted-foreground',
										)}
									>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{filters.dateRange?.from ? (
											filters.dateRange.to ? (
												<>
													{format(filters.dateRange.from, 'dd/MM/yy', {
														locale: fr,
													})}{' '}
													-{' '}
													{format(filters.dateRange.to, 'dd/MM/yy', {
														locale: fr,
													})}
												</>
											) : (
												format(filters.dateRange.from, 'dd/MM/yyyy', {
													locale: fr,
												})
											)
										) : (
											<span>Choisir dates</span>
										)}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<Calendar
										initialFocus
										mode="range"
										defaultMonth={filters.dateRange?.from}
										selected={filters.dateRange}
										onSelect={handleCalendarChange}
										numberOfMonths={2}
										locale={fr}
									/>
								</PopoverContent>
							</Popover>
						</div>
					)}
				</div>
			</PopoverContent>
		</Popover>
	)
}
