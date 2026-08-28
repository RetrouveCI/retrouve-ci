import { Input, Label } from '@app/ui/components'
import { FieldError } from '@app/ui/components/form'
import { AuthSubmitButton } from './auth-submit-button'
import { IvorianFlag } from './ivorian-flag'

interface PhoneStepProps {
	phoneNumber: string
	setPhoneNumber: (v: string) => void
	errors?: string[]
	isSubmitting: boolean
	hint?: string
	submitLabel?: string
	children?: React.ReactNode
}

export function PhoneStep({
	phoneNumber,
	setPhoneNumber,
	errors,
	isSubmitting,
	hint = 'Les espaces sont ajoutés à la saisie. Le clavier s’ouvre en mode numérique.',
	submitLabel = 'Recevoir mon code',
	children,
}: PhoneStepProps) {
	return (
		<div className="space-y-5">
			<div className="space-y-2">
				<Label htmlFor="phone" className="text-sm font-semibold">
					Numéro de téléphone
				</Label>
				<div className="flex gap-2.5">
					<div className="bg-muted/50 text-foreground flex h-13 shrink-0 items-center gap-2 rounded-xl border-[1.5px] px-3.5 text-sm font-semibold">
						<IvorianFlag className="h-3.5 w-5 rounded-[2px] ring-1 ring-black/10" />
						+225
					</div>
					<Input
						id="phone"
						name="phoneNumber"
						type="tel"
						inputMode="numeric"
						maxLength={14}
						placeholder="07 00 00 00 00"
						value={phoneNumber}
						onChange={e => setPhoneNumber(e.target.value)}
						className="border-border bg-background focus:border-primary-green focus:ring-primary-green/15 h-13 flex-1 rounded-xl border-[1.5px] text-[17px] tracking-[0.06em] tabular-nums transition-all focus:ring-[3px]"
						autoComplete="tel"
						autoFocus
					/>
				</div>
				<FieldError errors={errors} />
				<p className="text-muted-foreground text-xs">{hint}</p>
			</div>

			{children}

			<AuthSubmitButton
				isSubmitting={isSubmitting}
				pendingLabel="Envoi en cours..."
			>
				{submitLabel}
			</AuthSubmitButton>
		</div>
	)
}
