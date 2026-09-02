import type { Control } from 'react-hook-form'
import { useController } from 'react-hook-form'
import {
	FieldError,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@app/ui/components'
import { InputLabel } from '@app/ui/components/form'
import { ABIDJAN_COMMUNES, CI_VILLES } from '@/shared/constants/locations'
import type { LostItemType } from '@/shared/types/lost-item'
import type { PublishFormInput } from '../publish.schema'
import { DateChoice } from './date-choice'
import { MatchPreview } from './match-preview'
import { StepIntro } from './step-intro'

const COMMUNE_CITY = 'Abidjan'

interface PlaceStepProps {
	control: Control<PublishFormInput>
	type: LostItemType
}

export function PlaceStep({ control, type }: PlaceStepProps) {
	// `useController` rather than three render props: picking a city has to clear
	// the commune, which means one field's handler reaching another.
	const ville = useController({ control, name: 'ville' })
	const commune = useController({ control, name: 'commune' })
	const date = useController({ control, name: 'date' })
	const objectType = useController({ control, name: 'objectType' })

	const hasCommunes = ville.field.value === COMMUNE_CITY
	const isLost = type === 'lost'

	return (
		<div className="flex flex-col gap-5.5">
			<StepIntro
				title="Où et quand"
				description={
					isLost
						? 'Le lieu de la perte, même approximatif, sert à rapprocher votre annonce des objets trouvés.'
						: 'Le lieu de la trouvaille, même approximatif, sert à rapprocher votre annonce des objets perdus.'
				}
			/>

			<div className="space-y-2">
				<InputLabel htmlFor="ville" required className="text-sm">
					Ville
				</InputLabel>
				<Select
					value={ville.field.value ?? ''}
					// Radix answers once with an empty value as it mounts a `Select`
					// that starts with none. Taken at face value that reads as « the
					// city changed », which cleared both fields a restored draft had
					// just filled in.
					onValueChange={value => {
						if (!value || value === ville.field.value) return

						ville.field.onChange(value)
						commune.field.onChange('')
					}}
					onOpenChange={open => !open && ville.field.onBlur()}
				>
					<SelectTrigger
						id="ville"
						className="w-full text-base data-[size=default]:h-13"
						aria-invalid={ville.fieldState.invalid || undefined}
					>
						<SelectValue placeholder="Sélectionnez une ville" />
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
					<FieldError errors={[ville.fieldState.error]} />
				)}
			</div>

			<div className="space-y-2">
				<InputLabel htmlFor="commune" className="text-sm">
					Commune{' '}
					<span className="text-muted-foreground font-normal">
						(facultatif)
					</span>
				</InputLabel>
				<Select
					value={commune.field.value ?? ''}
					onValueChange={value => value && commune.field.onChange(value)}
					onOpenChange={open => !open && commune.field.onBlur()}
					disabled={!hasCommunes}
				>
					<SelectTrigger
						id="commune"
						className="w-full text-base data-[size=default]:h-13"
					>
						<SelectValue
							placeholder={
								hasCommunes ? 'Sélectionnez une commune' : 'Abidjan seulement'
							}
						/>
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

			<div className="space-y-2">
				<InputLabel htmlFor="date" required className="text-sm">
					{isLost ? 'Date de la perte' : 'Date de la trouvaille'}
				</InputLabel>
				<DateChoice
					id="date"
					value={date.field.value ?? ''}
					onChange={date.field.onChange}
					onBlur={date.field.onBlur}
					invalid={date.fieldState.invalid}
				/>
				{date.fieldState.error && (
					<FieldError errors={[date.fieldState.error]} />
				)}
			</div>

			<MatchPreview
				type={type}
				objectType={objectType.field.value ?? ''}
				ville={ville.field.value ?? ''}
			/>
		</div>
	)
}
