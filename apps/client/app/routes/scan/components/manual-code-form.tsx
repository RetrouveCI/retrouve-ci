import { Controller, useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { FieldError } from '@app/ui/components'
import { formatStickerCode, parseStickerCode } from '../helpers/sticker-code'
import {
	stickerCodeSchema,
	type StickerCodeData,
	type StickerCodeInput,
} from '../scan.schema'

interface ManualCodeFormProps {
	onCode: (code: string) => void
	onBack?: () => void
}

/**
 * The universal fallback: it works on a laptop, on a browser that refuses the
 * camera, and on a sticker whose QR is scratched. R6 opened this route with it
 * alone, and it stays exactly where it was.
 */
export function ManualCodeForm({ onCode, onBack }: ManualCodeFormProps) {
	const form = useForm<StickerCodeInput, unknown, StickerCodeData>({
		resolver: standardSchemaResolver(stickerCodeSchema),
		mode: 'onSubmit',
		reValidateMode: 'onChange',
		defaultValues: { code: '' },
	})

	const submit = form.handleSubmit(({ code }) => {
		const parsed = parseStickerCode(code)
		if (parsed.ok) onCode(parsed.code)
	})

	return (
		<form onSubmit={submit} className="space-y-4">
			<Controller
				control={form.control}
				name="code"
				render={({ field, fieldState }) => (
					<div className="space-y-1.5">
						<label htmlFor={field.name} className="text-sm font-medium">
							Code du sticker
						</label>
						<input
							{...field}
							onChange={event =>
								field.onChange(formatStickerCode(event.target.value))
							}
							id={field.name}
							placeholder="RCI-XXXXXX"
							autoComplete="off"
							autoCapitalize="characters"
							autoCorrect="off"
							spellCheck={false}
							aria-invalid={fieldState.invalid}
							className="bg-background border-border focus:border-primary-green focus:ring-primary-green/25 h-control text-field w-full rounded-[14px] border-[1.5px] px-4 tracking-wider uppercase transition-colors outline-none focus:ring-2"
						/>
						{fieldState.error ? (
							<FieldError errors={[fieldState.error]} className="text-xs" />
						) : null}
						<p className="text-muted-foreground text-sm">
							Il est imprimé sous le QR code de chaque sticker. Le tiret et les
							majuscules sont ajoutés au fur et à mesure.
						</p>
					</div>
				)}
			/>

			<button
				type="submit"
				className="bg-primary-green hover:bg-primary-green-dark h-control flex w-full items-center justify-center gap-2 rounded-[14px] text-base font-semibold text-white transition-colors"
			>
				Continuer
				<ArrowRight className="h-[18px] w-[18px]" />
			</button>

			{onBack ? (
				<button
					type="button"
					onClick={onBack}
					className="text-muted-foreground hover:text-foreground flex h-11 w-full items-center justify-center gap-1.5 text-sm font-medium transition-colors"
				>
					<ArrowLeft className="h-4 w-4" />
					Revenir au scanner
				</button>
			) : null}
		</form>
	)
}
