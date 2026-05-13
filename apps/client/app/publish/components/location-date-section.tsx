import { Label, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@retrouve-ci/ui/components'
import { CI_VILLES, ABIDJAN_COMMUNES } from '@/lib/ci-locations'

interface LocationDateSectionProps {
	ville: string
	commune: string
	date: string
	dateLabel: string
	sectionTitle: string
	onVilleChange: (value: string) => void
	onCommuneChange: (value: string) => void
	onDateChange: (value: string) => void
}

export function LocationDateSection({
	ville,
	commune,
	date,
	dateLabel,
	sectionTitle,
	onVilleChange,
	onCommuneChange,
	onDateChange,
}: LocationDateSectionProps) {
	return (
		<div className="bg-background space-y-5 rounded-2xl border p-6">
			<h2 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
				{sectionTitle}
			</h2>

			<div className="grid grid-cols-2 gap-3">
				<div className="space-y-1.5">
					<Label htmlFor="ville" className="text-sm">
						Ville <span className="text-destructive">*</span>
					</Label>
					<Select
						value={ville}
						onValueChange={v => {
							onVilleChange(v)
							onCommuneChange('')
						}}
					>
						<SelectTrigger id="ville" className="h-11">
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
				</div>

				<div className="space-y-1.5">
					<Label htmlFor="commune" className="text-sm">
						Commune{' '}
						{ville !== 'Abidjan' && (
							<span className="text-muted-foreground text-xs font-normal">
								(optionnel)
							</span>
						)}
					</Label>
					<Select
						value={commune}
						onValueChange={onCommuneChange}
						disabled={ville !== 'Abidjan'}
					>
						<SelectTrigger id="commune" className="h-11">
							<SelectValue
								placeholder={ville === 'Abidjan' ? 'Sélectionnez' : '—'}
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
				<Label htmlFor="date" className="text-sm">
					{dateLabel}{' '}
					<span className="text-muted-foreground text-xs font-normal">
						(optionnel)
					</span>
				</Label>
				<Input
					id="date"
					type="date"
					value={date}
					onChange={e => onDateChange(e.target.value)}
					className="h-11"
				/>
			</div>
		</div>
	)
}
