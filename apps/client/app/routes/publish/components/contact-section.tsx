import type { Control } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import { FieldError, Input } from '@app/ui/components'
import { InputLabel } from '@app/ui/components/form'
import { UserRound, Lock } from 'lucide-react'
import { SectionHeader } from './section-header'
import type { PublishFormInput } from '../publish.schema'

interface ContactSectionProps {
	control: Control<PublishFormInput>
	accentColor: string
	showPrivacyNote?: boolean
	step?: number
}

export function ContactSection({
	control,
	accentColor,
	showPrivacyNote = false,
	step,
}: ContactSectionProps) {
	return (
		<div className="bg-background space-y-5 rounded-2xl border p-6">
			<SectionHeader
				step={step}
				icon={UserRound}
				title="Vos coordonnées"
				description="Pour être contacté au sujet de l'objet."
				accentColor={accentColor}
			/>

			<Controller
				control={control}
				name="name"
				render={({ field, fieldState }) => (
					<div className="space-y-2">
						<InputLabel htmlFor={field.name}>Nom / Prénom</InputLabel>
						<Input
							{...field}
							id={field.name}
							value={field.value ?? ''}
							placeholder="Votre nom"
							className="h-11"
							aria-invalid={fieldState.invalid || undefined}
						/>
						{fieldState.error && (
							<FieldError errors={[fieldState.error]} className="text-xs" />
						)}
					</div>
				)}
			/>

			<Controller
				control={control}
				name="whatsapp"
				render={({ field, fieldState }) => (
					<div className="space-y-2">
						<InputLabel htmlFor={field.name}>Numéro WhatsApp</InputLabel>
						<div className="flex gap-2">
							<div className="bg-muted text-muted-foreground flex h-11 shrink-0 items-center rounded-md border px-3 text-sm">
								+225
							</div>
							<Input
								{...field}
								id={field.name}
								type="tel"
								value={field.value ?? ''}
								placeholder="07 XX XX XX XX"
								className="h-11 flex-1"
								aria-invalid={fieldState.invalid || undefined}
							/>
						</div>
						{fieldState.error && (
							<FieldError errors={[fieldState.error]} className="text-xs" />
						)}
					</div>
				)}
			/>

			{showPrivacyNote && (
				<div className="bg-muted/50 text-muted-foreground flex items-start gap-2 rounded-xl border p-3 text-xs">
					<Lock className="text-primary-green mt-0.5 h-3.5 w-3.5 shrink-0" />
					<span>
						Votre numéro ne sera jamais affiché publiquement. Le contact se fait
						via notre messagerie sécurisée.
					</span>
				</div>
			)}
		</div>
	)
}
