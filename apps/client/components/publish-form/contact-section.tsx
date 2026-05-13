import { Label, Input } from '@retrouve-ci/ui/components'
interface ContactSectionProps {
	name: string
	whatsapp: string
	onNameChange: (value: string) => void
	onWhatsappChange: (value: string) => void
	showPrivacyNote?: boolean
}

export function ContactSection({
	name,
	whatsapp,
	onNameChange,
	onWhatsappChange,
	showPrivacyNote = false,
}: ContactSectionProps) {
	return (
		<div className="bg-background space-y-5 rounded-2xl border p-6">
			<h2 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
				Vos coordonnées
			</h2>

			<div className="space-y-2">
				<Label htmlFor="name">Nom / Prénom</Label>
				<Input
					id="name"
					placeholder="Votre nom"
					value={name}
					onChange={e => onNameChange(e.target.value)}
					className="h-11"
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="whatsapp">Numéro WhatsApp</Label>
				<div className="flex gap-2">
					<div className="bg-muted text-muted-foreground flex h-11 shrink-0 items-center rounded-md border px-3 text-sm">
						+225
					</div>
					<Input
						id="whatsapp"
						type="tel"
						placeholder="07 XX XX XX XX"
						value={whatsapp}
						onChange={e => onWhatsappChange(e.target.value)}
						className="h-11 flex-1"
					/>
				</div>
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
