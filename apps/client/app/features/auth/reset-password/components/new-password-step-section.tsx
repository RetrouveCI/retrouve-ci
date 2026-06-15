import { useState } from 'react'
import { toast } from 'sonner'
import { useForm, useInputControl, getFormProps } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { newPasswordSchema } from '../reset-password.schema'
import { resetPhonePassword } from '../../lib/phone-auth.client'
import { PasswordStep } from '../../components/password-step'

interface NewPasswordStepSectionProps {
	phoneNumber: string
	otp: string
	onSuccess: () => void
	onFail: () => void
}

export function NewPasswordStepSection({
	phoneNumber,
	otp,
	onSuccess,
	onFail,
}: NewPasswordStepSectionProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleSubmit = async (value: {
		newPassword: string
		confirmPassword: string
	}) => {
		setIsSubmitting(true)
		const ok = await resetPhonePassword({
			phoneNumber,
			otp,
			newPassword: value.newPassword,
		})
		setIsSubmitting(false)
		if (!ok) {
			toast.error('Code incorrect ou expiré', {
				description: 'Veuillez resaisir le code reçu par SMS.',
			})
			onFail()
			return
		}
		toast.success('Mot de passe réinitialisé !', {
			description: 'Vous pouvez maintenant vous connecter.',
		})
		onSuccess()
	}

	const [form, fields] = useForm({
		id: 'reset-password-new-password-form',
		constraint: getZodConstraint(newPasswordSchema),
		shouldValidate: 'onSubmit',
		shouldRevalidate: 'onInput',
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: newPasswordSchema })
		},
		onSubmit(event, { submission }) {
			event.preventDefault()
			if (submission?.status !== 'success') return
			void handleSubmit(submission.value)
		},
	})
	const newPasswordControl = useInputControl(fields.newPassword)
	const confirmPasswordControl = useInputControl(fields.confirmPassword)

	return (
		<form {...getFormProps(form)}>
			<PasswordStep
				step="new-password"
				newPassword={newPasswordControl.value ?? ''}
				setNewPassword={newPasswordControl.change}
				confirmPassword={confirmPasswordControl.value ?? ''}
				setConfirmPassword={confirmPasswordControl.change}
				newPasswordErrors={fields.newPassword.errors}
				confirmPasswordErrors={fields.confirmPassword.errors}
				isSubmitting={isSubmitting}
			/>
		</form>
	)
}
