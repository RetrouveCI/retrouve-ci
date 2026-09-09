import type { Control } from 'react-hook-form'
import { Controller, useWatch } from 'react-hook-form'
import { FieldError, Input } from '@app/ui/components'
import { InputLabel } from '@app/ui/components/form'
import { cn } from '@app/ui/utils'
import { ShieldCheck } from 'lucide-react'
import { DOCUMENT_TYPE_LABELS } from '@/shared/constants/documents'
import type { PublishFormInput } from '../publish.schema'
import { StepIntro } from './step-intro'

const DAY_FORMAT = new Intl.DateTimeFormat('fr-FR', {
	day: 'numeric',
	month: 'long',
	year: 'numeric',
})

/** The field holds `YYYY-MM-DD`; `new Date(iso)` would read it as UTC. */
function formatDay(value: string): string {
	const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
	if (!parts) return value

	return DAY_FORMAT.format(
		new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3])),
	)
}

function SummaryRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-baseline justify-between gap-4 text-sm">
			<span className="text-muted-foreground shrink-0">{label}</span>
			<span className="truncate text-right font-semibold">{value}</span>
		</div>
	)
}

interface ContactStepProps {
	control: Control<PublishFormInput>
	photoCount: number
}

export function ContactStep({ control, photoCount }: ContactStepProps) {
	const values = useWatch({ control })

	const place = [values.commune, values.ville].filter(Boolean).join(', ')

	return (
		<div className="flex flex-col gap-5.5">
			<StepIntro
				title="Comment vous joindre"
				description="Votre numéro n'apparaît jamais sur l'annonce. Le contact passe par un bouton WhatsApp."
			/>

			<Controller
				control={control}
				name="name"
				render={({ field, fieldState }) => (
					<div className="space-y-2">
						<InputLabel htmlFor={field.name} required className="text-sm">
							Votre nom
						</InputLabel>
						<Input
							{...field}
							id={field.name}
							value={field.value ?? ''}
							placeholder="Ex : Konan"
							className="h-control"
							aria-invalid={fieldState.invalid || undefined}
						/>
						{fieldState.error && <FieldError errors={[fieldState.error]} />}
					</div>
				)}
			/>

			<Controller
				control={control}
				name="whatsapp"
				render={({ field, fieldState }) => (
					<div className="space-y-2">
						<InputLabel htmlFor={field.name} required className="text-sm">
							Numéro WhatsApp
						</InputLabel>
						{/* The indicative sits inside the field rather than beside it: two
						    boxes read as two inputs, and only one of them is typed in. */}
						<div
							className={cn(
								'border-border bg-background focus-within:border-ring h-control flex items-center rounded-xl border-[1.5px] px-3.5',
								fieldState.invalid && 'border-destructive',
							)}
						>
							<span className="text-muted-foreground border-border mr-2.5 shrink-0 border-r pr-2.5 text-sm">
								+225
							</span>
							<input
								{...field}
								id={field.name}
								type="tel"
								inputMode="tel"
								value={field.value ?? ''}
								placeholder="07 00 00 00 00"
								aria-invalid={fieldState.invalid || undefined}
								className="text-field h-full min-w-0 flex-1 bg-transparent outline-none"
							/>
						</div>
						<p className="text-muted-foreground text-xs">
							Dix chiffres après l&apos;indicatif.
						</p>
						{fieldState.error && <FieldError errors={[fieldState.error]} />}
					</div>
				)}
			/>

			<div className="bg-muted/40 border-border flex items-start gap-3 rounded-2xl border p-4">
				<ShieldCheck className="text-primary-green-text mt-0.5 h-5 w-5 shrink-0" />
				<div>
					<p className="text-sm font-semibold">Votre numéro reste privé</p>
					<p className="text-muted-foreground mt-1 text-xs leading-relaxed">
						Il sert uniquement à ouvrir la conversation quand quelqu&apos;un
						vous contacte.
					</p>
				</div>
			</div>

			<div className="border-border space-y-2.5 border-t pt-4.5">
				<p className="mb-3 text-sm font-semibold">Récapitulatif</p>
				<SummaryRow label="Objet" value={values.title || 'Non renseigné'} />
				<SummaryRow label="Lieu" value={place || 'Non renseigné'} />
				<SummaryRow
					label="Date"
					value={values.date ? formatDay(values.date) : 'Non renseignée'}
				/>
				{values.documentType && (
					<SummaryRow
						label="Pièce"
						value={DOCUMENT_TYPE_LABELS[values.documentType]}
					/>
				)}
				<SummaryRow label="Photos" value={String(photoCount)} />
			</div>
		</div>
	)
}
