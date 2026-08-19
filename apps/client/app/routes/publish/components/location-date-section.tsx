import type { Control } from 'react-hook-form'
import { useController } from 'react-hook-form'
import {
	FieldError,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@app/ui/components'
import { InputLabel } from '@app/ui/components/form'
import { MapPin } from 'lucide-react'
import { CI_VILLES, ABIDJAN_COMMUNES } from '@/shared/constants/locations'
import { SectionHeader } from './section-header'
import type { PublishFormInput } from '../publish.schema'

const COMMUNE_CITY = 'Abidjan'

interface LocationDateSectionProps {
	control: Control<PublishFormInput>
	dateLabel: string
	sectionTitle: string
	accentColor: string
	step?: number
}

export function LocationDateSection({
	control,
	dateLabel,
	sectionTitle,
	accentColor,
	step,
}: LocationDateSectionProps) {
	// `useController` rather than three `Controller` render props: picking a city
	// has to clear the commune, which means one field's handler reaching another.
	const ville = useController({ control, name: 'ville' })
	const commune = useController({ control, name: 'commune' })
	const date = useController({ control, name: 'date' })

	const hasCommunes = ville.field.value === COMMUNE_CITY

	return (
		<div className="bg-background space-y-5 rounded-2xl border p-6">
			<SectionHeader
				step={step}
				icon={MapPin}
				title={sectionTitle}
				accentColor={accentColor}
			/>

			<div className="grid grid-cols-2 gap-3">
				<div className="space-y-1.5">
					<InputLabel htmlFor="ville" required className="text-sm">
						Ville
					</InputLabel>
					<Select
						value={ville.field.value ?? ''}
						onValueChange={value => {
							ville.field.onChange(value)
							commune.field.onChange('')
						}}
						onOpenChange={open => !open && ville.field.onBlur()}
					>
						<SelectTrigger
							id="ville"
							className="h-11"
							aria-invalid={ville.fieldState.invalid || undefined}
						>
							<SelectValue placeholder="Sélectionnez" />
						</SelectTrigger>
						<SelectContent>
							{CI_VILLES.map(city => (
								<SelectItem key={city} value={city}>
									{city}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{ville.fieldState.error && (
						<FieldError errors={[ville.fieldState.error]} className="text-xs" />
					)}
				</div>

				<div className="space-y-1.5">
					<InputLabel htmlFor="commune" className="text-sm">
						Commune{' '}
						{!hasCommunes && (
							<span className="text-muted-foreground text-xs font-normal">
								(optionnel)
							</span>
						)}
					</InputLabel>
					<Select
						value={commune.field.value ?? ''}
						onValueChange={commune.field.onChange}
						onOpenChange={open => !open && commune.field.onBlur()}
						disabled={!hasCommunes}
					>
						<SelectTrigger id="commune" className="h-11">
							<SelectValue placeholder={hasCommunes ? 'Sélectionnez' : '—'} />
						</SelectTrigger>
						<SelectContent>
							{ABIDJAN_COMMUNES.map(name => (
								<SelectItem key={name} value={name}>
									{name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="space-y-1.5">
				<InputLabel htmlFor="date" className="text-sm">
					{dateLabel}{' '}
					<span className="text-muted-foreground text-xs font-normal">
						(optionnel)
					</span>
				</InputLabel>
				<Input
					{...date.field}
					id="date"
					type="date"
					value={date.field.value ?? ''}
					className="h-11"
				/>
			</div>
		</div>
	)
}
