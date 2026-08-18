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
	const { submit, isSubmitting } = useActionFetcher({
		onOk: () => {
			toast.success('Mot de passe réinitialisé !', {
				description: 'Vous pouvez maintenant vous connecter.',
			})
			onSuccess()
		},
		onError: () => {
			toast.error('Code incorrect ou expiré', {
				description: 'Veuillez resaisir le code reçu par SMS.',
			})
			onFail()
		},
	})

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
		void submit(
			{
				intent: 'reset-password',
				phoneNumber,
				otp,
				newPassword: values.newPassword,
			},
			{ method: 'post' },
		)
	}

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
				isSubmitting={isSubmitting}
			/>
		</form>
	)
}
