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
		<section className="space-y-4 rounded-2xl border border-red-700/25 bg-red-50 p-4 dark:border-red-400/25 dark:bg-red-950/25">
			<div>
				{/*
				 * `text-destructive` measures 2,98:1 on the dark background, so the
				 * block names both inks outright — heading and body alike.
				 */}
				<h2 className="flex items-center gap-2 text-sm font-bold text-red-800 dark:text-red-300">
					<Trash2 className="h-4 w-4" />
					Supprimer mon compte
				</h2>
				<p className="mt-1 text-[12.5px] leading-relaxed text-red-800 dark:text-red-300">
					Vos annonces et vos stickers seront désactivés. Cette action est
					définitive.
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
					<Button
						variant="outline"
						className="touch-target h-10.5 rounded-xl border-[1.5px] border-red-700/35 bg-transparent text-[13.5px] font-semibold text-red-800 hover:bg-red-700/10 hover:text-red-800 dark:border-red-400/35 dark:text-red-300 dark:hover:text-red-300"
					>
						Supprimer mon compte
					</Button>
				</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
						<AlertDialogDescription>
							Cette action supprimera définitivement votre compte, vos annonces
							et vos stickers. Cette action est irréversible.
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
		</section>
	)
}
