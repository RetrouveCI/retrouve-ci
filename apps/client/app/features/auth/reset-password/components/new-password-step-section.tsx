import { useEffect } from 'react'
import { useFetcher } from 'react-router'
import { toast } from 'sonner'
import { useForm, useInputControl, getFormProps } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { newPasswordSchema } from '../reset-password.schema'
import { PasswordStep } from '../../components/password-step'

interface ActionResult {
	ok: boolean
	error?: string
}

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
	const fetcher = useFetcher<ActionResult>()

	useEffect(() => {
		if (fetcher.state !== 'idle' || !fetcher.data) return

		if (fetcher.data.ok) {
			toast.success('Mot de passe réinitialisé !', {
				description: 'Vous pouvez maintenant vous connecter.',
			})
			onSuccess()
		} else {
			toast.error('Code incorrect ou expiré', {
				description: 'Veuillez resaisir le code reçu par SMS.',
			})
			onFail()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fetcher.state, fetcher.data])

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
			void fetcher.submit(
				{
					intent: 'reset-password',
					phoneNumber,
					otp,
					newPassword: submission.value.newPassword,
				},
				{ method: 'post' },
			)
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
				isSubmitting={fetcher.state !== 'idle'}
			/>
		</form>
	)
}
