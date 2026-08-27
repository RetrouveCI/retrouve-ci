import { useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { PASSWORD_HINT, PASSWORD_PLACEHOLDER } from '@app/contracts/shared'
import { CheckCircle2, Loader2, Lock } from 'lucide-react'
import {
	Alert,
	AlertDescription,
	AlertTitle,
	Button,
	FieldGroup,
} from '@app/ui/components'
import { FormRootError } from '@app/ui/components/form'
import { PasswordField } from '@/components/password-field'
import { useActionFetcher } from '@/shared/hooks/use-action-fetcher'
import {
	resetPasswordSchema,
	type ResetPasswordData,
	type ResetPasswordInput,
} from '../reset-password.schema'
import type { action } from '../_index'

export function ResetPasswordForm({ token }: { token: string }) {
	const fetcher = useActionFetcher<typeof action, ResetPasswordInput>()

	const form = useForm<ResetPasswordInput, unknown, ResetPasswordData>({
		resolver: standardSchemaResolver(resetPasswordSchema),
		mode: 'onSubmit',
		reValidateMode: 'onChange',
		defaultValues: { token, newPassword: '', confirmPassword: '' },
		errors: fetcher.errors,
	})

	const onSubmit = (values: ResetPasswordData) => {
		void fetcher.submit(
			{
				token: values.token,
				newPassword: values.newPassword,
				confirmPassword: values.confirmPassword,
			},
			{ method: 'post' },
		)
	}

	// Success replaces the form: the password is set, there is nothing left to
	// submit, and the card's footer already links back to the login page.
	if (fetcher.isOk) {
		return (
			<Alert>
				<CheckCircle2 />
				<AlertTitle>Mot de passe réinitialisé</AlertTitle>
				<AlertDescription>
					Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
				</AlertDescription>
			</Alert>
		)
	}

	return (
		<form
			onSubmit={form.handleSubmit(onSubmit)}
			noValidate
			className="space-y-5"
		>
			<FormRootError
				title="Impossible de réinitialiser le mot de passe"
				message={form.formState.errors.root?.message}
			/>

			<FieldGroup className="gap-4">
				<PasswordField
					control={form.control}
					name="newPassword"
					label="Nouveau mot de passe"
					placeholder={PASSWORD_PLACEHOLDER}
					hint={PASSWORD_HINT}
					icon={Lock}
					inputClassName="h-10 rounded-lg"
					disabled={fetcher.isSubmitting}
					autoFocus
				/>

				<PasswordField
					control={form.control}
					name="confirmPassword"
					label="Confirmer le mot de passe"
					placeholder="••••••••"
					icon={Lock}
					inputClassName="h-10 rounded-lg"
					disabled={fetcher.isSubmitting}
				/>
			</FieldGroup>

			<Button
				type="submit"
				className="h-10 w-full rounded-lg text-sm font-medium"
				disabled={fetcher.isSubmitting}
			>
				{fetcher.isSubmitting ? (
					<>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						Réinitialisation...
					</>
				) : (
					'Réinitialiser le mot de passe'
				)}
			</Button>
		</form>
	)
}
