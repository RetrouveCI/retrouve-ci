import { useEffect } from 'react'
import { useFetcher, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { useForm, useInputControl, getFormProps } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { newPasswordSchema } from '../register.schema'
import { PasswordStep } from '../../components/password-step'

export function CreatePasswordStepSection() {
	const navigate = useNavigate()
	const fetcher = useFetcher<{ ok: boolean; error?: string }>()

	useEffect(() => {
		if (fetcher.state !== 'idle' || !fetcher.data) return

		if (fetcher.data.ok) {
			toast.success('Compte créé !', {
				description: 'Bienvenue sur RetrouveCI.',
			})
			navigate('/account')
		} else {
			toast.error(
				fetcher.data.error ?? 'Une erreur est survenue. Veuillez réessayer.',
			)
		}
	}, [fetcher.state, fetcher.data, navigate])

	const [form, fields] = useForm({
		id: 'register-password-form',
		constraint: getZodConstraint(newPasswordSchema),
		shouldValidate: 'onSubmit',
		shouldRevalidate: 'onInput',
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: newPasswordSchema })
		},
	})
	const newPasswordControl = useInputControl(fields.newPassword)
	const confirmPasswordControl = useInputControl(fields.confirmPassword)

	return (
		<fetcher.Form method="post" {...getFormProps(form)}>
			<input type="hidden" name="intent" value="set-initial-password" />
			<PasswordStep
				step="create-password"
				newPassword={newPasswordControl.value ?? ''}
				setNewPassword={newPasswordControl.change}
				confirmPassword={confirmPasswordControl.value ?? ''}
				setConfirmPassword={confirmPasswordControl.change}
				newPasswordErrors={fields.newPassword.errors}
				confirmPasswordErrors={fields.confirmPassword.errors}
				isSubmitting={fetcher.state !== 'idle'}
			/>
		</fetcher.Form>
	)
}
