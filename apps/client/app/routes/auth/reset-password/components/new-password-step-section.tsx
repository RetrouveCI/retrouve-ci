import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useController, useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { toErrorList } from '../../helpers/field-errors'
import { useActionFetcher } from '@/shared/hooks/use-action-fetcher'
import {
	newPasswordSchema,
	type NewPasswordData,
	type NewPasswordInput,
} from '../reset-password.schema'
import { PasswordStep } from '../../components/password-step'
import type { action } from '../_index'

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
	const [hasSubmitted, setHasSubmitted] = useState(false)

	// No `errors:` bridge here: a failure means the OTP was refused, and this
	// step unmounts to send the user back to the code — there is no form left to
	// show a root error in. The server's message travels in the toast instead.
	const fetcher = useActionFetcher<typeof action, NewPasswordInput>()

	const form = useForm<NewPasswordInput, unknown, NewPasswordData>({
		resolver: standardSchemaResolver(newPasswordSchema),
		mode: 'onSubmit',
		reValidateMode: 'onChange',
		defaultValues: { newPassword: '', confirmPassword: '' },
	})

	const newPassword = useController({
		control: form.control,
		name: 'newPassword',
	})
	const confirmPassword = useController({
		control: form.control,
		name: 'confirmPassword',
	})

	const onSubmit = (values: NewPasswordData) => {
		setHasSubmitted(true)
		void fetcher.submit(
			{
				intent: 'reset-password',
				phoneNumber,
				otp,
				newPassword: values.newPassword,
			},
			{ method: 'post' },
		)
	}

	useEffect(() => {
		if (!hasSubmitted || fetcher.state !== 'idle') return

		setHasSubmitted(false)

		if (fetcher.isOk) {
			toast.success('Mot de passe réinitialisé !', {
				description: 'Vous pouvez maintenant vous connecter.',
			})
			onSuccess()
			return
		}

		toast.error('Code incorrect ou expiré', {
			description:
				fetcher.errors?.root?.message ??
				'Veuillez resaisir le code reçu par SMS.',
		})
		onFail()
	}, [
		hasSubmitted,
		fetcher.state,
		fetcher.isOk,
		fetcher.errors,
		onSuccess,
		onFail,
	])

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} noValidate>
			<PasswordStep
				step="new-password"
				newPassword={newPassword.field.value}
				setNewPassword={newPassword.field.onChange}
				confirmPassword={confirmPassword.field.value}
				setConfirmPassword={confirmPassword.field.onChange}
				newPasswordErrors={toErrorList(newPassword.fieldState.error)}
				confirmPasswordErrors={toErrorList(confirmPassword.fieldState.error)}
				isSubmitting={fetcher.isSubmitting}
			/>
		</form>
	)
}
