import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	FieldError,
} from '@app/ui/components'
import { FormRootError } from '@app/ui/components/form'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { Check, Loader2, QrCode, ScanLine, ShieldCheck } from 'lucide-react'
import { useActionFetcher } from '@/shared/hooks/use-action-fetcher'
import { useSettledSubmission } from '@/shared/hooks/use-settled-submission'
import {
	activateScannedStickerSchema,
	type ActivateScannedStickerData,
	type ActivateScannedStickerInput,
} from '../scan.schema'
import type { scanAction } from '../servers/scan.action'

interface ActivationSheetProps {
	code: string
	onNext: () => void
	onFinish: () => void
}

const FIELD =
	'bg-background border-border focus:border-primary-green focus:ring-primary-green/25 h-control w-full rounded-xl border-[1.5px] px-3.5 text-field transition-colors outline-none focus:ring-2'

const PRIMARY =
	'bg-primary-green hover:bg-primary-green-dark h-control flex w-full items-center justify-center gap-2 rounded-[14px] text-base font-semibold text-white transition-colors disabled:opacity-70'

const SECONDARY =
	'text-muted-foreground hover:text-foreground flex h-11 w-full items-center justify-center gap-2 text-sm font-medium transition-colors'

/**
 * A name, and nothing else mandatory. It is a sheet and not `/q/:code` because
 * that screen is the finder's — §2.2 keeps it the single contact screen, and
 * this one contacts nobody.
 */
export function ActivationSheet({
	code,
	onNext,
	onFinish,
}: ActivationSheetProps) {
	const fetcher = useActionFetcher<
		typeof scanAction,
		ActivateScannedStickerInput
	>()
	const [activated, setActivated] = useState(false)

	const form = useForm<
		ActivateScannedStickerInput,
		unknown,
		ActivateScannedStickerData
	>({
		resolver: standardSchemaResolver(activateScannedStickerSchema),
		mode: 'onSubmit',
		reValidateMode: 'onChange',
		errors: fetcher.errors,
		defaultValues: { code, label: '', linkedObject: '' },
	})

	// A failure needs no toast: `FormRootError` carries it next to the button.
	useSettledSubmission(fetcher.response, result => {
		if (result.success) setActivated(true)
	})

	const onSubmit = (values: ActivateScannedStickerData) => {
		void fetcher.submit({ ...values }, { method: 'post' })
	}

	// Swiped away: the camera picks up where it left off. Only « Terminer »
	// leaves for « Mes stickers ».
	return (
		<Drawer open onOpenChange={next => !next && onNext()}>
			<DrawerContent className="safe-x lg:mx-auto lg:max-w-md lg:rounded-t-2xl">
				<div
					className="px-5 pt-1 pb-5"
					style={{
						paddingBottom: 'calc(var(--safe-bottom) + 1.25rem)',
					}}
				>
					{activated ? (
						<ActivatedState code={code} onNext={onNext} onFinish={onFinish} />
					) : (
						<>
							<DrawerHeader className="flex flex-row items-center gap-3 p-0 pb-4 text-left">
								<span className="bg-primary-green/12 flex h-12.5 w-12.5 shrink-0 items-center justify-center rounded-[14px]">
									<QrCode className="text-primary-green-text h-6.5 w-6.5" />
								</span>
								<span className="min-w-0 flex-1">
									<DrawerTitle className="text-xl tracking-tight">
										Sticker reconnu
									</DrawerTitle>
									<DrawerDescription className="text-xs font-semibold tracking-wide">
										{code}
									</DrawerDescription>
								</span>
								<span className="flex h-5.5 items-center rounded-full bg-yellow-700 px-2.5 text-xs font-bold tracking-wide text-white">
									NON ACTIVÉ
								</span>
							</DrawerHeader>

							<form
								onSubmit={form.handleSubmit(onSubmit)}
								noValidate
								className="space-y-4"
							>
								<FormRootError message={form.formState.errors.root?.message} />

								<Controller
									control={form.control}
									name="label"
									render={({ field, fieldState }) => (
										<div className="space-y-1.5">
											<label
												htmlFor={field.name}
												className="text-sm font-semibold"
											>
												Sur quel objet le collez-vous&nbsp;?
											</label>
											<input
												{...field}
												id={field.name}
												placeholder="Ex : Clés de la maison"
												autoComplete="off"
												aria-invalid={fieldState.invalid}
												className={FIELD}
											/>
											{fieldState.error ? (
												<FieldError
													errors={[fieldState.error]}
													className="text-xs"
												/>
											) : null}
											<p className="text-muted-foreground text-xs">
												Ce nom s&apos;affiche à la personne qui scanne. Restez
												vague&nbsp;: «&nbsp;clés de la maison&nbsp;» suffit.
											</p>
										</div>
									)}
								/>

								<Controller
									control={form.control}
									name="linkedObject"
									render={({ field, fieldState }) => (
										<div className="space-y-1.5">
											<label
												htmlFor={field.name}
												className="text-sm font-semibold"
											>
												Description de l&apos;objet (optionnel)
											</label>
											<input
												{...field}
												id={field.name}
												placeholder="Ex : Trousseau avec porte-clés bleu"
												autoComplete="off"
												aria-invalid={fieldState.invalid}
												className={FIELD}
											/>
											{fieldState.error ? (
												<FieldError
													errors={[fieldState.error]}
													className="text-xs"
												/>
											) : null}
										</div>
									)}
								/>

								<div className="border-border flex items-start gap-3 rounded-[13px] border p-3.5">
									<span className="bg-primary-green/12 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
										<ShieldCheck className="text-primary-green-text h-4.5 w-4.5" />
									</span>
									<p className="text-muted-foreground text-xs leading-relaxed">
										Une fois activé, quiconque scanne ce sticker peut vous
										joindre — sans jamais voir votre numéro.
									</p>
								</div>

								<div className="space-y-1">
									<button
										type="submit"
										disabled={fetcher.isSubmitting}
										className={PRIMARY}
									>
										{fetcher.isSubmitting && (
											<Loader2 className="h-4 w-4 animate-spin" />
										)}
										Activer ce sticker
									</button>
									<button type="button" onClick={onNext} className={SECONDARY}>
										Scanner le suivant
									</button>
								</div>
							</form>
						</>
					)}
				</div>
			</DrawerContent>
		</Drawer>
	)
}

/** A pack is twelve, so the next tap after a success is the next sticker. */
function ActivatedState({
	code,
	onNext,
	onFinish,
}: {
	code: string
	onNext: () => void
	onFinish: () => void
}) {
	return (
		<>
			<DrawerHeader className="flex flex-row items-center gap-3 p-0 pb-5 text-left">
				<span className="bg-primary-green flex h-12.5 w-12.5 shrink-0 items-center justify-center rounded-[14px]">
					<Check className="h-6.5 w-6.5 text-white" strokeWidth={2.6} />
				</span>
				<span className="min-w-0 flex-1">
					<DrawerTitle className="text-xl tracking-tight">
						Sticker activé
					</DrawerTitle>
					<DrawerDescription className="text-xs font-semibold tracking-wide">
						{code}
					</DrawerDescription>
				</span>
			</DrawerHeader>

			<div className="space-y-1">
				<button type="button" onClick={onNext} className={PRIMARY}>
					<ScanLine className="h-4.5 w-4.5" />
					Scanner le suivant
				</button>
				<button type="button" onClick={onFinish} className={SECONDARY}>
					Terminer
				</button>
			</div>
		</>
	)
}
