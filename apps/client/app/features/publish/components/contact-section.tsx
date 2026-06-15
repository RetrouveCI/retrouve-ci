import { Input } from '@retrouve-ci/ui/components'
import { getInputProps, type FieldMetadata } from '@conform-to/react'
import { InputLabel } from '@/shared/components/form/input-label'
import { InputField } from '@/shared/components/form/input-field'
import { FieldError } from '@/shared/components/form/field-error'

interface ContactSectionProps {
	name: FieldMetadata<string>
	whatsapp: FieldMetadata<string>
	showPrivacyNote?: boolean
}

export function ContactSection({
	name,
	whatsapp,
	showPrivacyNote = false,
}: ContactSectionProps) {
	return (
		<div className="bg-background space-y-5 rounded-2xl border p-6">
			<h2 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
				Vos coordonnées
			</h2>

			<InputField field={name} label="Nom / Prénom" placeholder="Votre nom" />

			<div className="space-y-2">
				<InputLabel htmlFor={whatsapp.id}>Numéro WhatsApp</InputLabel>
				<div className="flex gap-2">
					<div className="bg-muted text-muted-foreground flex h-11 shrink-0 items-center rounded-md border px-3 text-sm">
						+225
					</div>
					<Input
						{...getInputProps(whatsapp, { type: 'tel' })}
						key={whatsapp.key}
						placeholder="07 XX XX XX XX"
						className="h-11 flex-1"
					/>
				</div>
				<FieldError errors={whatsapp.errors} />
			</div>

			{showPrivacyNote && (
				<p className="text-muted-foreground pt-1 text-xs">
					Votre numéro ne sera jamais affiché publiquement. Le contact se fait
					via notre messagerie sécurisée.
				</p>
			)}
		</div>
	)
}
