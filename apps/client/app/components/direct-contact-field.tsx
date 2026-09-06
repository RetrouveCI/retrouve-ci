import { Controller } from 'react-hook-form'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { Switch } from '@app/ui/components'
import { Phone, ShieldCheck } from 'lucide-react'

interface DirectContactFieldProps<
	TFieldValues extends FieldValues,
	TName extends FieldPath<TFieldValues>,
	TTransformedValues = TFieldValues,
> {
	control: Control<TFieldValues, unknown, TTransformedValues>
	name: TName
}

const LABEL = "Accepter d'être joint directement"

/**
 * The consent A8 gates the jump on, asked wherever a sticker is named — so one
 * activated before this step can still give it. The sentence below the switch
 * says what the current position does: a jump shows the line it dials, and no
 * wording can make that untrue.
 */
export function DirectContactField<
	TFieldValues extends FieldValues,
	TName extends FieldPath<TFieldValues>,
	TTransformedValues = TFieldValues,
>({
	control,
	name,
}: DirectContactFieldProps<TFieldValues, TName, TTransformedValues>) {
	return (
		<Controller
			control={control}
			name={name}
			render={({ field }) => {
				const on = field.value === true
				const Icon = on ? Phone : ShieldCheck

				return (
					<div className="border-border flex min-h-14 items-start gap-3 rounded-[13px] border p-3.5">
						<span className="bg-primary-green/12 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
							<Icon className="text-primary-green-text h-4.5 w-4.5" />
						</span>
						<span className="min-w-0 flex-1">
							<span className="block text-sm font-semibold">{LABEL}</span>
							<span className="text-muted-foreground mt-0.5 block text-xs leading-relaxed">
								{on
									? "Un trouveur pourra vous appeler ou vous écrire sur WhatsApp. Votre numéro s'affichera sur son téléphone."
									: 'Personne ne verra votre numéro : un trouveur ne pourra que vous laisser un message.'}
							</span>
						</span>
						<Switch
							checked={on}
							onCheckedChange={field.onChange}
							onBlur={field.onBlur}
							name={field.name}
							aria-label={LABEL}
							className="touch-target mt-0.5 shrink-0"
						/>
					</div>
				)
			}}
		/>
	)
}
