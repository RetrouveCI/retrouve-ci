import { Label, Input } from '@retrouve-ci/ui/components'
import { getInputProps, type FieldMetadata } from '@conform-to/react'

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

			<div className="space-y-2">
				<Label htmlFor={name.id}>Nom / Prénom</Label>
				<Input
					{...getInputProps(name, { type: 'text' })}
					key={name.key}
					placeholder="Votre nom"
					className="h-11"
				/>
				{name.errors && (
					<p className="text-destructive text-xs">{name.errors[0]}</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor={whatsapp.id}>Numéro WhatsApp</Label>
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
				{whatsapp.errors && (
					<p className="text-destructive text-xs">{whatsapp.errors[0]}</p>
				)}
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
