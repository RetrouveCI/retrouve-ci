import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@app/ui/components'
import { FormInputField, FormRootError } from '@app/ui/components/form'
import { useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Sticker } from '@/shared/types/sticker'
import { useActionFetcher } from '@/shared/hooks/use-action-fetcher'
import { useSettledSubmission } from '@/shared/hooks/use-settled-submission'
import {
	updateStickerSchema,
	type UpdateStickerData,
	type UpdateStickerInput,
} from '../stickers.schema'
import type { stickersAction } from '../servers/stickers.action'

interface EditStickerDialogProps {
	sticker: Sticker
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function EditStickerDialog({
	sticker,
	open,
	onOpenChange,
}: EditStickerDialogProps) {
	const fetcher = useActionFetcher<typeof stickersAction, UpdateStickerInput>()

	const defaults: UpdateStickerInput = {
		intent: 'update',
		code: sticker.code,
		label: sticker.label ?? '',
		linkedObject: sticker.linkedObject ?? '',
	}

	const form = useForm<UpdateStickerInput, unknown, UpdateStickerData>({
		resolver: standardSchemaResolver(updateStickerSchema),
		mode: 'onSubmit',
		reValidateMode: 'onChange',
		errors: fetcher.errors,
		defaultValues: defaults,
	})

	// A failure needs no toast: `FormRootError` already carries it, inside the
	// dialog the reader is looking at.
	useSettledSubmission(fetcher.response, result => {
		if (!result.success) return

		toast.success('Sticker mis à jour')
		onOpenChange(false)
	})

	return (
		<Dialog
			open={open}
			onOpenChange={next => {
				onOpenChange(next)
				if (next) form.reset(defaults)
			}}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Modifier le sticker</DialogTitle>
					<DialogDescription>{sticker.code}</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={form.handleSubmit(values =>
						fetcher.submit(values, { method: 'post' }),
					)}
					noValidate
					className="space-y-4"
				>
					<FormRootError message={form.formState.errors.root?.message} />

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
							onClick={() => onOpenChange(false)}
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
							Enregistrer
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
