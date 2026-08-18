import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { useController, useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { toErrorList } from '../../lib/field-errors'
import { useActionFetcher } from '@/shared/hooks/use-action-fetcher'
import {
	newPasswordSchema,
	type NewPasswordData,
	type NewPasswordInput,
} from '../register.schema'
import { PasswordStep } from '../../components/password-step'

export function CreatePasswordStepSection({
	redirectTo,
}: {
	redirectTo: string
}) {
	const navigate = useNavigate()

	const { submit, isSubmitting } = useActionFetcher({
		onOk: () => {
			toast.success('Compte créé !', {
				description: 'Bienvenue sur RetrouveCI.',
			})
			navigate(redirectTo, { replace: true })
		},
		onError: result => {
			toast.error(
				result.error ?? 'Une erreur est survenue. Veuillez réessayer.',
			)
		},
	})

	const form = useForm<NewPasswordInput, unknown, NewPasswordData>({
		resolver: standardSchemaResolver(newPasswordSchema),
		mode: 'onSubmit',
		reValidateMode: 'onChange',
		defaultValues: { newPassword: '', confirmPassword: '' },
	})

	// `useController` rather than `Controller`: `PasswordStep` takes both fields
	// as a flat prop contract, which a render prop per field cannot feed without
	// nesting one inside the other.
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
			{ intent: 'set-initial-password', newPassword: values.newPassword },
			{ method: 'post' },
		)
	}

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} noValidate>
			<PasswordStep
				step="create-password"
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
