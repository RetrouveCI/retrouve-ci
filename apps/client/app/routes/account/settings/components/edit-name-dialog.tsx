import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	FieldError,
	Input,
} from '@app/ui/components'
import { FormRootError, InputLabel } from '@app/ui/components/form'
import { Loader2, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useActionFetcher } from '@/shared/hooks/use-action-fetcher'
import {
	updateNameSchema,
	type UpdateNameData,
	type UpdateNameInput,
} from '../settings.schema'
import type { action } from '../_index'

export function EditNameDialog({
	currentName,
	trigger,
}: {
	currentName: string
	trigger: React.ReactNode
}) {
	const [open, setOpen] = useState(false)
	const [hasSubmitted, setHasSubmitted] = useState(false)

	const fetcher = useActionFetcher<typeof action, UpdateNameInput>()

	const form = useForm<UpdateNameInput, unknown, UpdateNameData>({
		resolver: standardSchemaResolver(updateNameSchema),
		mode: 'onBlur',
		reValidateMode: 'onChange',
		errors: fetcher.errors,
		defaultValues: { intent: 'update-name', name: currentName },
	})

	const onSubmit = (values: UpdateNameData) => {
		setHasSubmitted(true)
		void fetcher.submit(values, { method: 'post' })
	}

	// `fetcher.isOk` stays true once the dialog has closed, so reopening it would
	// replay this effect: the flag is what makes it fire once per submission.
	useEffect(() => {
		if (!hasSubmitted || !fetcher.isOk) return

		setHasSubmitted(false)
		toast.success('Nom mis à jour')
		setOpen(false)
	}, [hasSubmitted, fetcher.isOk])

	return (
		<Dialog
			open={open}
			onOpenChange={next => {
				setOpen(next)
				// Reset on open, not on close: a successful save closes the dialog from
				// the effect above, which never goes through `onOpenChange`. Resetting
				// here means it always opens on the value the loader last returned.
				if (next) form.reset({ intent: 'update-name', name: currentName })
			}}
		>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Nom et prénoms</DialogTitle>
					<DialogDescription className="sr-only">
						Modifier votre nom et prénoms
					</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					noValidate
					className="space-y-4"
				>
					<FormRootError message={form.formState.errors.root?.message} />

					<Controller
						control={form.control}
						name="name"
						render={({ field, fieldState }) => (
							<div className="space-y-2">
								<InputLabel htmlFor={field.name}>Nom et prénoms</InputLabel>
								<Input
									{...field}
									id={field.name}
									value={field.value ?? ''}
									placeholder="Ex : Adjoua Konan"
									className="h-11"
									aria-invalid={fieldState.invalid || undefined}
								/>
								{fieldState.error && (
									<FieldError errors={[fieldState.error]} className="text-xs" />
								)}
							</div>
						)}
					/>

					<Button
						type="submit"
						disabled={fetcher.isSubmitting}
						className="bg-primary-green hover:bg-primary-green-dark h-11 w-full gap-2 rounded-xl text-white"
					>
						{fetcher.isSubmitting ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />
								Enregistrement...
							</>
						) : (
							<>
								<Check className="h-4 w-4" />
								Enregistrer
							</>
						)}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	)
}
