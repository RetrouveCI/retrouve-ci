import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { useController, useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { FormRootError } from '@app/ui/components/form'
import { toErrorList } from '../../helpers/field-errors'
import { useActionFetcher } from '@/shared/hooks/use-action-fetcher'
import {
	newPasswordSchema,
	type NewPasswordData,
	type NewPasswordInput,
} from '../register.schema'
import { PasswordStep } from '../../components/password-step'
import type { action } from '../_index'

export function CreatePasswordStepSection({
	redirectTo,
}: {
	redirectTo: string
}) {
	const navigate = useNavigate()
	const [hasSubmitted, setHasSubmitted] = useState(false)

	const fetcher = useActionFetcher<typeof action, NewPasswordInput>()

	const form = useForm<NewPasswordInput, unknown, NewPasswordData>({
		resolver: standardSchemaResolver(newPasswordSchema),
		mode: 'onSubmit',
		errors: fetcher.errors,
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
			{ intent: 'set-initial-password', newPassword: values.newPassword },
			{ method: 'post' },
		)
	}

	useEffect(() => {
		if (!hasSubmitted || !fetcher.isOk) return

		setHasSubmitted(false)
		toast.success('Compte créé !', {
			description: 'Bienvenue sur RetrouveCI.',
		})
		void navigate(redirectTo, { replace: true })
	}, [hasSubmitted, fetcher.isOk, navigate, redirectTo])

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} noValidate>
			<FormRootError
				message={form.formState.errors.root?.message}
				className="mb-5"
			/>

			<PasswordStep
				step="create-password"
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
