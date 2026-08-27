import { useState } from 'react'
import { useController, useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { PASSWORD_HINT, PASSWORD_PLACEHOLDER } from '@app/contracts/shared'
import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	FieldError,
} from '@app/ui/components'
import { FormRootError } from '@app/ui/components/form'
import { Loader2, Check } from 'lucide-react'
import { toast } from 'sonner'
import { PasswordInput } from '@/routes/auth/components/password-input'
import {
	changePasswordSchema,
	type ChangePasswordData,
	type ChangePasswordInput,
} from '../settings.schema'
import { changePassword } from '../helpers/settings.client'

export function ChangePasswordDialog() {
	const [open, setOpen] = useState(false)
	const [isSaving, setIsSaving] = useState(false)

	// No fetcher here: `authClient.changePassword` is a browser call, so the
	// failure message comes back in hand and lands on `root` through `setError`.
	const form = useForm<ChangePasswordInput, unknown, ChangePasswordData>({
		resolver: standardSchemaResolver(changePasswordSchema),
		mode: 'onSubmit',
		reValidateMode: 'onChange',
		defaultValues: {
			currentPassword: '',
			newPassword: '',
			confirmPassword: '',
		},
	})

	const current = useController({
		control: form.control,
		name: 'currentPassword',
	})
	const next = useController({ control: form.control, name: 'newPassword' })
	const confirm = useController({
		control: form.control,
		name: 'confirmPassword',
	})

	const onSubmit = async (values: ChangePasswordData) => {
		setIsSaving(true)
		const result = await changePassword(
			values.currentPassword,
			values.newPassword,
		)
		setIsSaving(false)

		if (!result.ok) {
			form.setError('root', {
				type: 'custom',
				message: result.error ?? 'Une erreur est survenue',
			})
			return
		}

		toast.success('Mot de passe modifié')
		setOpen(false)
		form.reset()
	}

	return (
		<Dialog
			open={open}
			onOpenChange={isOpen => {
				setOpen(isOpen)
				if (!isOpen) form.reset()
			}}
		>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm" className="rounded-xl">
					Modifier
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Mot de passe</DialogTitle>
					<DialogDescription className="sr-only">
						Changer votre mot de passe
					</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					noValidate
					className="space-y-4"
				>
					<FormRootError message={form.formState.errors.root?.message} />

					<div className="space-y-1">
						<PasswordInput
							id="current-password"
							name={current.field.name}
							label="Mot de passe actuel"
							value={current.field.value ?? ''}
							onChange={current.field.onChange}
							disabled={isSaving}
						/>
						{current.fieldState.error && (
							<FieldError
								errors={[current.fieldState.error]}
								className="text-xs"
							/>
						)}
					</div>
					<div className="space-y-1">
						<PasswordInput
							id="new-password"
							name={next.field.name}
							label="Nouveau mot de passe"
							value={next.field.value ?? ''}
							onChange={next.field.onChange}
							placeholder={PASSWORD_PLACEHOLDER}
							hint={PASSWORD_HINT}
							disabled={isSaving}
						/>
						{next.fieldState.error && (
							<FieldError
								errors={[next.fieldState.error]}
								className="text-xs"
							/>
						)}
					</div>
					<div className="space-y-1">
						<PasswordInput
							id="confirm-password"
							name={confirm.field.name}
							label="Confirmer le mot de passe"
							value={confirm.field.value ?? ''}
							onChange={confirm.field.onChange}
							disabled={isSaving}
						/>
						{confirm.fieldState.error && (
							<FieldError
								errors={[confirm.fieldState.error]}
								className="text-xs"
							/>
						)}
					</div>

					<Button
						type="submit"
						disabled={isSaving}
						className="bg-primary-green hover:bg-primary-green-dark h-11 w-full gap-2 rounded-xl text-white"
					>
						{isSaving ? (
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
