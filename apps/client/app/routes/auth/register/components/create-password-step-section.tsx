import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { useController, useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { Input, Label } from '@app/ui/components'
import { FieldError, FormRootError } from '@app/ui/components/form'
import { toErrorList } from '../../helpers/field-errors'
import { useActionFetcher } from '@/shared/hooks/use-action-fetcher'
import {
	newPasswordSchema,
	type NewPasswordData,
	type NewPasswordInput,
} from '../register.schema'
import { AuthSubmitButton } from '../../components/auth-submit-button'
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
		defaultValues: { newPassword: '', confirmPassword: '', name: '' },
	})

	const newPassword = useController({
		control: form.control,
		name: 'newPassword',
	})
	const confirmPassword = useController({
		control: form.control,
		name: 'confirmPassword',
	})
	const firstName = useController({ control: form.control, name: 'name' })

	const onSubmit = (values: NewPasswordData) => {
		setHasSubmitted(true)
		void fetcher.submit(
			{
				intent: 'set-initial-password',
				newPassword: values.newPassword,
				name: values.name,
			},
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
		<form
			onSubmit={form.handleSubmit(onSubmit)}
			noValidate
			className="space-y-6"
		>
			<FormRootError message={form.formState.errors.root?.message} />

			<PasswordStep
				newPassword={newPassword.field.value}
				setNewPassword={newPassword.field.onChange}
				confirmPassword={confirmPassword.field.value}
				setConfirmPassword={confirmPassword.field.onChange}
				newPasswordErrors={toErrorList(newPassword.fieldState.error)}
				confirmPasswordErrors={toErrorList(confirmPassword.fieldState.error)}
				isSubmitting={fetcher.isSubmitting}
			/>

			<div className="space-y-2">
				<Label htmlFor="first-name" className="text-sm font-semibold">
					Votre prénom
				</Label>
				<Input
					id="first-name"
					name="name"
					value={firstName.field.value}
					onChange={firstName.field.onChange}
					placeholder="Konan"
					autoComplete="given-name"
					disabled={fetcher.isSubmitting}
					className="border-border bg-background focus:border-primary-green focus:ring-primary-green/15 h-control rounded-xl border-[1.5px] transition-all focus:ring-[3px]"
				/>
				<FieldError errors={toErrorList(firstName.fieldState.error)} />
				{/* The artboard added « Votre nom complet reste privé » — there is no
				    second, private name to keep, so the promise is left unsaid. */}
				<p className="text-muted-foreground text-xs">
					Affiché sur vos annonces, à la personne qui trouve votre objet.
				</p>
			</div>

			<AuthSubmitButton
				isSubmitting={fetcher.isSubmitting}
				pendingLabel="Création du compte..."
			>
				Créer mon compte
			</AuthSubmitButton>
		</form>
	)
}
