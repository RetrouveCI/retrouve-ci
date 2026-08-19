import { Controller, useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { CheckCircle2, Loader2, Mail } from 'lucide-react'
import {
	Alert,
	AlertDescription,
	AlertTitle,
	Button,
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
	Input,
} from '@app/ui/components'
import { FormRootError } from '@app/ui/components/form'
import { useActionFetcher } from '@/shared/hooks/use-action-fetcher'
import {
	forgotPasswordSchema,
	type ForgotPasswordData,
	type ForgotPasswordInput,
} from '../forgot-password.schema'
import type { action } from '../_index'

export function ForgotPasswordForm() {
	const fetcher = useActionFetcher<typeof action, ForgotPasswordInput>()

	const form = useForm<ForgotPasswordInput, unknown, ForgotPasswordData>({
		resolver: standardSchemaResolver(forgotPasswordSchema),
		mode: 'onSubmit',
		reValidateMode: 'onChange',
		defaultValues: { email: '' },
		errors: fetcher.errors,
	})

	const onSubmit = (values: ForgotPasswordData) => {
		void fetcher.submit({ email: values.email }, { method: 'post' })
	}

	// Success replaces the form rather than firing a toast: the instructions stay
	// on screen, and there is nothing left to submit on this page.
	if (fetcher.isOk) {
		return (
			<Alert>
				<CheckCircle2 />
				<AlertTitle>Instructions envoyées</AlertTitle>
				<AlertDescription>
					Si cet email est enregistré, vous recevrez les instructions de
					réinitialisation.
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
				title="Impossible d’envoyer les instructions"
				message={form.formState.errors.root?.message}
			/>

			<FieldGroup className="gap-4">
				<Controller
					control={form.control}
					name="email"
					render={({ field, fieldState }) => (
						<Field className="gap-2" data-invalid={fieldState.invalid}>
							<FieldLabel htmlFor={field.name} className="text-sm font-medium">
								Email
							</FieldLabel>
							<div className="relative">
								<Mail className="text-muted-foreground/70 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
								<Input
									{...field}
									id={field.name}
									type="email"
									placeholder="admin@retrouveci.com"
									className="h-10 rounded-lg pl-9"
									aria-invalid={fieldState.invalid}
									disabled={fetcher.isSubmitting}
									autoComplete="email"
									autoFocus
								/>
							</div>
							{fieldState.error && <FieldError errors={[fieldState.error]} />}
						</Field>
					)}
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
						Envoi en cours...
					</>
				) : (
					'Envoyer les instructions'
				)}
			</Button>
		</form>
	)
}
