'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'
import type { DateRange } from 'react-day-picker'

import { cn } from '@repo/ui/lib/utils'
import { Button } from '@repo/ui/components/ui/button'
import { Calendar } from '@repo/ui/components/ui/calendar'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@repo/ui/components/ui/popover'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@repo/ui/components/ui/select'

interface DateRangePickerProps {
	dateRange: DateRange | undefined
	onDateRangeChange: (range: DateRange | undefined) => void
	className?: string
}

export function DateRangePicker({
	dateRange,
	onDateRangeChange,
	className,
}: DateRangePickerProps) {
	const [preset, setPreset] = React.useState<string>('all')

	const handlePresetChange = (value: string) => {
		setPreset(value)
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
			case 'year':
				from = new Date(today.getFullYear(), 0, 1)
				break
			case 'all':
				from = undefined
				to = undefined
				break
			default:
				from = undefined
				to = undefined
		}

		onDateRangeChange(from && to ? { from, to } : undefined)
	}

	const handleCalendarChange = (range: DateRange | undefined) => {
		setPreset('custom')
		onDateRangeChange(range)
	}

	return (
		<div className={cn('flex items-center gap-2', className)}>
			<Select value={preset} onValueChange={handlePresetChange}>
				<SelectTrigger className="w-[140px]">
					<SelectValue placeholder="Période" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">Toute période</SelectItem>
					<SelectItem value="today">Aujourd&apos;hui</SelectItem>
					<SelectItem value="7days">7 derniers jours</SelectItem>
					<SelectItem value="30days">30 derniers jours</SelectItem>
					<SelectItem value="90days">90 derniers jours</SelectItem>
					<SelectItem value="year">Cette année</SelectItem>
					<SelectItem value="custom">Personnalisé</SelectItem>
				</SelectContent>
			</Select>

			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						className={cn(
							'justify-start text-left font-normal',
							!dateRange && 'text-muted-foreground',
						)}
					>
						<CalendarIcon className="mr-2 h-4 w-4" />
						{dateRange?.from ? (
							dateRange.to ? (
								<>
									{format(dateRange.from, 'dd/MM/yy', { locale: fr })} -{' '}
									{format(dateRange.to, 'dd/MM/yy', { locale: fr })}
								</>
							) : (
								format(dateRange.from, 'dd/MM/yyyy', { locale: fr })
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
						defaultMonth={dateRange?.from}
						selected={dateRange}
						onSelect={handleCalendarChange}
						numberOfMonths={2}
						locale={fr}
					/>
				</PopoverContent>
			</Popover>
		</div>
	)
}
