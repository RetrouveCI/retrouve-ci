import { useState } from 'react'
import { useForm, useInputControl, getFormProps } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@retrouve-ci/ui/components'
import { FieldError } from '@retrouve-ci/ui/components/form'
import { Loader2, Check } from 'lucide-react'
import { toast } from 'sonner'
import { PasswordInput } from '@/features/auth/components/password-input'
import { changePasswordSchema } from '../settings.schema'
import { changePassword } from '../lib/settings.client'

export function ChangePasswordDialog() {
	const [open, setOpen] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const [error, setError] = useState('')

	const [form, fields] = useForm({
		id: 'change-password-form',
		constraint: getZodConstraint(changePasswordSchema),
		shouldValidate: 'onSubmit',
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: changePasswordSchema })
		},
		onSubmit(event, { submission }) {
			event.preventDefault()
			if (submission?.status !== 'success') return
			void handleSave(
				submission.value.currentPassword,
				submission.value.newPassword,
			)
		},
	})
	const current = useInputControl(fields.currentPassword)
	const next = useInputControl(fields.newPassword)
	const confirm = useInputControl(fields.confirmPassword)

	const handleSave = async (currentPassword: string, newPassword: string) => {
		setError('')
		setIsSaving(true)
		const res = await changePassword(currentPassword, newPassword)
		setIsSaving(false)
		if (res.ok) {
			toast.success('Mot de passe modifié')
			setOpen(false)
			form.reset()
		} else {
			setError(res.error ?? 'Une erreur est survenue')
		}
	}

	return (
		<Dialog
			open={open}
			onOpenChange={next => {
				setOpen(next)
				if (!next) {
					form.reset()
					setError('')
				}
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
				<form {...getFormProps(form)} className="space-y-4">
					<div className="space-y-1">
						<PasswordInput
							id="current-password"
							name="currentPassword"
							label="Mot de passe actuel"
							value={current.value ?? ''}
							onChange={current.change}
							disabled={isSaving}
						/>
						<FieldError errors={fields.currentPassword.errors} />
					</div>
					<div className="space-y-1">
						<PasswordInput
							id="new-password"
							name="newPassword"
							label="Nouveau mot de passe"
							value={next.value ?? ''}
							onChange={next.change}
							placeholder="6 caractères minimum"
							disabled={isSaving}
						/>
						<FieldError errors={fields.newPassword.errors} />
					</div>
					<div className="space-y-1">
						<PasswordInput
							id="confirm-password"
							name="confirmPassword"
							label="Confirmer le mot de passe"
							value={confirm.value ?? ''}
							onChange={confirm.change}
							disabled={isSaving}
						/>
						<FieldError errors={fields.confirmPassword.errors} />
					</div>
					{error && <p className="text-destructive text-sm">{error}</p>}
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
