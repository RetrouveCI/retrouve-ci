import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useController, useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import {
	Button,
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
	FieldError,
} from '@app/ui/components'
import { FormRootError } from '@app/ui/components/form'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { PasswordInput } from '@/routes/auth/components/password-input'
import { useActionFetcher } from '@/shared/hooks/use-action-fetcher'
import {
	deleteAccountSchema,
	type DeleteAccountData,
	type DeleteAccountInput,
} from '../settings.schema'
import type { action } from '../_index'

export function DangerZoneSection() {
	const navigate = useNavigate()
	const [open, setOpen] = useState(false)
	const [hasSubmitted, setHasSubmitted] = useState(false)

	const fetcher = useActionFetcher<typeof action, DeleteAccountInput>()

	const form = useForm<DeleteAccountInput, unknown, DeleteAccountData>({
		resolver: standardSchemaResolver(deleteAccountSchema),
		mode: 'onSubmit',
		reValidateMode: 'onChange',
		errors: fetcher.errors,
		defaultValues: { intent: 'delete-account', password: '' },
	})

	// `PasswordInput` takes its value and its handler as flat props, which a
	// render prop cannot feed without nesting one inside the other.
	const password = useController({ control: form.control, name: 'password' })

	const onSubmit = (values: DeleteAccountData) => {
		setHasSubmitted(true)
		void fetcher.submit(values, { method: 'post' })
	}

	useEffect(() => {
		if (!hasSubmitted || !fetcher.isOk) return

		setHasSubmitted(false)
		toast.success('Votre compte a été supprimé')
		void navigate('/')
	}, [hasSubmitted, fetcher.isOk, navigate])

	return (
		<div className="border-destructive/20 bg-destructive/5 overflow-hidden rounded-2xl border">
			<div className="border-destructive/20 bg-destructive/10 border-b p-5">
				<h2 className="text-destructive flex items-center gap-2 font-semibold">
					<Trash2 className="h-4 w-4" />
					Zone de danger
				</h2>
			</div>
			<div className="space-y-4 p-5">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm font-medium">Supprimer mon compte</p>
						<p className="text-muted-foreground text-xs">
							Cette action est irréversible et supprimera toutes vos données.
						</p>
					</div>
					<AlertDialog
						open={open}
						onOpenChange={next => {
							setOpen(next)
							// Reset on open — see `edit-name-dialog.tsx`.
							if (next) form.reset({ intent: 'delete-account', password: '' })
						}}
					>
						<AlertDialogTrigger asChild>
							<Button variant="destructive" size="sm" className="rounded-xl">
								Supprimer
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
								<AlertDialogDescription>
									Cette action supprimera définitivement votre compte, vos
									annonces et vos stickers. Cette action est irréversible.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								noValidate
								className="py-2"
							>
								<FormRootError
									message={form.formState.errors.root?.message}
									className="mb-4"
								/>

								<PasswordInput
									id="delete-account-password"
									name={password.field.name}
									label="Confirmez avec votre mot de passe"
									value={password.field.value ?? ''}
									onChange={password.field.onChange}
									disabled={fetcher.isSubmitting}
								/>
								{password.fieldState.error && (
									<FieldError
										errors={[password.fieldState.error]}
										className="text-xs"
									/>
								)}

								<AlertDialogFooter>
									<AlertDialogCancel className="rounded-xl">
										Annuler
									</AlertDialogCancel>
									<Button
										type="submit"
										variant="destructive"
										disabled={!password.field.value || fetcher.isSubmitting}
										className="rounded-xl"
									>
										Supprimer mon compte
									</Button>
								</AlertDialogFooter>
							</form>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</div>
		</div>
	)
}
