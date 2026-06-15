import { Button, Input, Label } from '@retrouve-ci/ui/components'
import { FieldError } from '@retrouve-ci/ui/components/form'
import { Loader2 } from 'lucide-react'

interface PhoneStepProps {
	phoneNumber: string
	setPhoneNumber: (v: string) => void
	errors?: string[]
	isSubmitting: boolean
	hint?: string
	submitLabel?: string
}

export function PhoneStep({
	phoneNumber,
	setPhoneNumber,
	errors,
	isSubmitting,
	hint = 'Un code de vérification vous sera envoyé.',
	submitLabel = 'Continuer',
}: PhoneStepProps) {
	return (
		<div className="space-y-5">
			<div className="space-y-2">
				<Label htmlFor="phone" className="text-sm font-medium">
					Numéro de téléphone
				</Label>
				<div className="flex gap-2">
					<div className="bg-muted/50 text-muted-foreground flex h-12 shrink-0 items-center rounded-xl border-2 px-4 text-sm font-medium">
						<img
							src="/logo.png"
							alt=""
							width={18}
							height={18}
							className="mr-2 rounded-sm"
						/>
						+225
					</div>
					<Input
						id="phone"
						name="phoneNumber"
						type="tel"
						placeholder="07 XX XX XX XX"
						value={phoneNumber}
						onChange={e => setPhoneNumber(e.target.value)}
						className="border-border bg-background focus:border-primary-green focus:ring-primary-green/20 h-12 flex-1 rounded-xl border-2 transition-all focus:ring-2"
						autoComplete="tel"
						autoFocus
					/>
				</div>
				<FieldError errors={errors} />
				<p className="text-muted-foreground text-xs">{hint}</p>
			</div>

			<Button
				type="submit"
				className="bg-primary-green hover:bg-primary-green-dark h-12 w-full rounded-xl text-base font-semibold text-white transition-all hover:scale-[1.02]"
				disabled={isSubmitting}
			>
				{isSubmitting ? (
					<>
						<Loader2 className="h-4 w-4 animate-spin" /> Envoi en cours...
					</>
				) : (
					submitLabel
				)}
			</Button>
		</div>
	)
}
