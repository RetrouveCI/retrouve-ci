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
} from '@retrouve-ci/ui/components'
import { useEffect, useState } from 'react'
import { useFetcher, useNavigate } from 'react-router'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useForm, useInputControl, getFormProps } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { PasswordInput } from '@/features/auth/components/password-input'
import { FieldError } from '@retrouve-ci/ui/components/form'
import { deleteAccountSchema } from '../settings.schema'

interface ActionResult {
	ok: boolean
	error?: string
}

export function DangerZoneSection() {
	const fetcher = useFetcher<ActionResult>()
	const navigate = useNavigate()
	const [open, setOpen] = useState(false)

	const [form, fields] = useForm({
		id: 'delete-account-form',
		constraint: getZodConstraint(deleteAccountSchema),
		shouldValidate: 'onSubmit',
		shouldRevalidate: 'onInput',
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: deleteAccountSchema })
		},
	})

	const passwordControl = useInputControl(fields.password)

	useEffect(() => {
		if (fetcher.state !== 'idle' || !fetcher.data) return

		if (fetcher.data.ok) {
			toast.success('Votre compte a été supprimé')
			navigate('/')
		} else {
			toast.error(fetcher.data.error ?? 'Mot de passe incorrect')
		}
	}, [fetcher.state, fetcher.data, navigate])

	const handleOpenChange = (next: boolean) => {
		setOpen(next)
		if (!next) form.reset()
	}

	const isDeleting = fetcher.state !== 'idle'

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
					<AlertDialog open={open} onOpenChange={handleOpenChange}>
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
							<fetcher.Form
								method="post"
								{...getFormProps(form)}
								className="py-2"
							>
								<input type="hidden" name="intent" value="delete-account" />
								<PasswordInput
									id="delete-account-password"
									label="Confirmez avec votre mot de passe"
									value={passwordControl.value ?? ''}
									onChange={passwordControl.change}
									disabled={isDeleting}
								/>
								<FieldError errors={fields.password.errors} />
								<AlertDialogFooter>
									<AlertDialogCancel className="rounded-xl">
										Annuler
									</AlertDialogCancel>
									<Button
										type="submit"
										variant="destructive"
										disabled={!passwordControl.value || isDeleting}
										className="rounded-xl"
									>
										Supprimer mon compte
									</Button>
								</AlertDialogFooter>
							</fetcher.Form>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</div>
		</div>
	)
}
