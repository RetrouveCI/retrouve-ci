import { useState } from 'react'
import {
	Button,
	Input,
	Field,
	FieldGroup,
	FieldLabel,
} from '@retrouve-ci/ui/components'
import { FieldError } from '@retrouve-ci/ui/components/form'
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { BentoCard } from '@/shared/components/bento-card'
import { toast } from 'sonner'
import { useForm, getFormProps, getInputProps } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { changePasswordSchema } from '../profile.schema'
import { changePassword } from '../lib/profile.client'

export function PasswordChangeForm() {
	const [showCurrent, setShowCurrent] = useState(false)
	const [showNew, setShowNew] = useState(false)
	const [showConfirm, setShowConfirm] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const [form, fields] = useForm({
		id: 'change-password-form',
		constraint: getZodConstraint(changePasswordSchema),
		shouldValidate: 'onBlur',
		shouldRevalidate: 'onInput',
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: changePasswordSchema })
		},
		async onSubmit(event, { formData }) {
			event.preventDefault()
			const submission = parseWithZod(formData, {
				schema: changePasswordSchema,
			})
			if (submission.status !== 'success') return

			setIsSubmitting(true)
			try {
				const result = await changePassword(
					submission.value.currentPassword,
					submission.value.newPassword,
				)
				if (result.ok) {
					toast.success('Mot de passe mis à jour avec succès')
					form.reset()
				} else {
					toast.error(result.error ?? 'Mot de passe actuel incorrect')
				}
			} finally {
				setIsSubmitting(false)
			}
		},
	})

	return (
		<BentoCard variant="content" className="lg:col-span-2">
			<div className="p-6">
				<div className="mb-4 flex items-center gap-2">
					<Lock className="text-primary h-5 w-5" />
					<h4 className="text-lg font-semibold">Changer le mot de passe</h4>
				</div>
				<p className="text-muted-foreground mb-5 text-sm">
					Mettez à jour votre mot de passe pour sécuriser votre compte.
				</p>

				<form {...getFormProps(form)} className="max-w-md">
					<FieldGroup className="space-y-4">
						<Field>
							<FieldLabel htmlFor={fields.currentPassword.id}>
								Mot de passe actuel
							</FieldLabel>
							<div className="relative">
								<Input
									{...getInputProps(fields.currentPassword, {
										type: showCurrent ? 'text' : 'password',
									})}
									className="pr-10"
								/>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
									onClick={() => setShowCurrent(p => !p)}
								>
									{showCurrent ? (
										<EyeOff className="text-muted-foreground h-4 w-4" />
									) : (
										<Eye className="text-muted-foreground h-4 w-4" />
									)}
								</Button>
							</div>
							<FieldError errors={fields.currentPassword.errors} />
						</Field>

						<Field>
							<FieldLabel htmlFor={fields.newPassword.id}>
								Nouveau mot de passe
							</FieldLabel>
							<div className="relative">
								<Input
									{...getInputProps(fields.newPassword, {
										type: showNew ? 'text' : 'password',
									})}
									className="pr-10"
								/>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
									onClick={() => setShowNew(p => !p)}
								>
									{showNew ? (
										<EyeOff className="text-muted-foreground h-4 w-4" />
									) : (
										<Eye className="text-muted-foreground h-4 w-4" />
									)}
								</Button>
							</div>
							<p className="text-muted-foreground text-xs">
								Min. 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
							</p>
							<FieldError errors={fields.newPassword.errors} />
						</Field>

						<Field>
							<FieldLabel htmlFor={fields.confirmPassword.id}>
								Confirmer le mot de passe
							</FieldLabel>
							<div className="relative">
								<Input
									{...getInputProps(fields.confirmPassword, {
										type: showConfirm ? 'text' : 'password',
									})}
									className="pr-10"
								/>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
									onClick={() => setShowConfirm(p => !p)}
								>
									{showConfirm ? (
										<EyeOff className="text-muted-foreground h-4 w-4" />
									) : (
										<Eye className="text-muted-foreground h-4 w-4" />
									)}
								</Button>
							</div>
							<FieldError errors={fields.confirmPassword.errors} />
						</Field>
					</FieldGroup>

					<Button type="submit" className="mt-6" disabled={isSubmitting}>
						{isSubmitting ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Mise à jour...
							</>
						) : (
							'Mettre à jour le mot de passe'
						)}
					</Button>
				</form>
			</div>
		</BentoCard>
	)
}
