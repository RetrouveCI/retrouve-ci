import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@app/ui/components'
import { FormInputField, FormRootError } from '@app/ui/components/form'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useActionFetcher } from '@/shared/hooks/use-action-fetcher'
import { useSettledSubmission } from '@/shared/hooks/use-settled-submission'
import {
	activateStickerSchema,
	type ActivateStickerData,
	type ActivateStickerInput,
} from '../stickers.schema'
import type { stickersAction } from '../servers/stickers.action'

const EMPTY: ActivateStickerInput = {
	intent: 'activate',
	code: '',
	label: '',
	linkedObject: '',
}

export function ActivateStickerDialog({
	trigger,
}: {
	trigger?: React.ReactNode
}) {
	const fetcher = useActionFetcher<
		typeof stickersAction,
		ActivateStickerInput
	>()
	const [open, setOpen] = useState(false)

	const form = useForm<ActivateStickerInput, unknown, ActivateStickerData>({
		resolver: standardSchemaResolver(activateStickerSchema),
		mode: 'onSubmit',
		reValidateMode: 'onChange',
		errors: fetcher.errors,
		defaultValues: EMPTY,
	})

	// A failure needs no toast: `FormRootError` already carries it, inside the
	// dialog the reader is looking at.
	useSettledSubmission(fetcher.response, result => {
		if (!result.success) return

		toast.success('Sticker activé')
		form.reset(EMPTY)
		setOpen(false)
	})

	const onSubmit = (values: ActivateStickerData) => {
		void fetcher.submit(
			{ ...values, code: values.code.toUpperCase() },
			{ method: 'post' },
		)
	}

	return (
		<Dialog
			open={open}
			onOpenChange={next => {
				setOpen(next)
				if (next) form.reset(EMPTY)
			}}
		>
			<DialogTrigger asChild>
				{trigger ?? (
					<Button className="bg-primary-green hover:bg-primary-green-dark h-control w-full gap-2 rounded-[14px] text-lg text-white">
						<Plus className="h-4.5 w-4.5" />
						Activer un sticker
					</Button>
				)}
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Activer un sticker</DialogTitle>
					<DialogDescription>
						Le code est imprimé sous le QR de chaque sticker.
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={form.handleSubmit(onSubmit)}
					noValidate
					className="space-y-4"
				>
					<FormRootError message={form.formState.errors.root?.message} />

					<FormInputField
						control={form.control}
						name="code"
						label="Code du sticker"
						required
						placeholder="RCI-XXXX-XXXX"
						className="h-11 tracking-wider uppercase"
					/>
					<FormInputField
						control={form.control}
						name="label"
						label="Nom du sticker"
						required
						placeholder="Ex : Clés de la maison"
					/>
					<FormInputField
						control={form.control}
						name="linkedObject"
						label="Description de l'objet (optionnel)"
						placeholder="Ex : Trousseau avec porte-clés bleu"
					/>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							className="rounded-xl"
						>
							Annuler
						</Button>
						<Button
							type="submit"
							disabled={fetcher.isSubmitting}
							className="bg-primary-green hover:bg-primary-green-dark gap-2 rounded-xl text-white"
						>
							{fetcher.isSubmitting && (
								<Loader2 className="h-4 w-4 animate-spin" />
							)}
							Activer
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
