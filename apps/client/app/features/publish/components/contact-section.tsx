import { Input } from '@retrouve-ci/ui/components'
import { getInputProps, type FieldMetadata } from '@conform-to/react'
import { UserRound, Lock } from 'lucide-react'
import {
	InputLabel,
	InputField,
	FieldError,
} from '@retrouve-ci/ui/components/form'
import { SectionHeader } from './section-header'

interface ContactSectionProps {
	name: FieldMetadata<string>
	whatsapp: FieldMetadata<string>
	accentColor: string
	showPrivacyNote?: boolean
	step?: number
}

export function ContactSection({
	name,
	whatsapp,
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
