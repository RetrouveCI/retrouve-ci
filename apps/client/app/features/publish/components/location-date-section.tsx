import {
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@retrouve-ci/ui/components'
import {
	getInputProps,
	useInputControl,
	type FieldMetadata,
} from '@conform-to/react'
import { CI_VILLES, ABIDJAN_COMMUNES } from '@/shared/constants'
import { InputLabel, FieldError } from '@retrouve-ci/ui/components/form'

interface LocationDateSectionProps {
	ville: FieldMetadata<string>
	commune: FieldMetadata<string>
	date: FieldMetadata<string>
	dateLabel: string
	sectionTitle: string
}

export function LocationDateSection({
	ville,
	commune,
	date,
	dateLabel,
	sectionTitle,
}: LocationDateSectionProps) {
	const villeControl = useInputControl(ville)
	const communeControl = useInputControl(commune)

	return (
		<div className="bg-background space-y-5 rounded-2xl border p-6">
			<h2 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
				{sectionTitle}
			</h2>

			<div className="grid grid-cols-2 gap-3">
				<div className="space-y-1.5">
					<InputLabel htmlFor={ville.id} required className="text-sm">
						Ville
					</InputLabel>
					<Select
						value={villeControl.value ?? ''}
						onValueChange={v => {
							villeControl.change(v)
							communeControl.change('')
						}}
						onOpenChange={open => !open && villeControl.blur()}
					>
						<SelectTrigger id={ville.id} className="h-11">
							<SelectValue placeholder="Sélectionnez" />
						</SelectTrigger>
						<SelectContent>
							{CI_VILLES.map(v => (
								<SelectItem key={v} value={v}>
									{v}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<FieldError errors={ville.errors} />
				</div>

				<div className="space-y-1.5">
					<InputLabel htmlFor={commune.id} className="text-sm">
						Commune{' '}
						{villeControl.value !== 'Abidjan' && (
							<span className="text-muted-foreground text-xs font-normal">
								(optionnel)
							</span>
						)}
					</InputLabel>
					<Select
						value={communeControl.value ?? ''}
						onValueChange={communeControl.change}
						onOpenChange={open => !open && communeControl.blur()}
						disabled={villeControl.value !== 'Abidjan'}
					>
						<SelectTrigger id={commune.id} className="h-11">
							<SelectValue
								placeholder={
									villeControl.value === 'Abidjan' ? 'Sélectionnez' : '—'
								}
							/>
						</SelectTrigger>
						<SelectContent>
							{ABIDJAN_COMMUNES.map(c => (
								<SelectItem key={c} value={c}>
									{c}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="space-y-1.5">
				<InputLabel htmlFor={date.id} className="text-sm">
					{dateLabel}{' '}
					<span className="text-muted-foreground text-xs font-normal">
						(optionnel)
					</span>
				</InputLabel>
				<Input
					{...getInputProps(date, { type: 'date' })}
					key={date.key}
					className="h-11"
				/>
			</div>
		</div>
	)
}
