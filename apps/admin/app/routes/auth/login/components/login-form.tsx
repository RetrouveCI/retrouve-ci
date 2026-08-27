import { Link } from 'react-router'
import { Controller, useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { Loader2, Lock, Mail } from 'lucide-react'
import {
	Button,
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
	Input,
} from '@app/ui/components'
import { FormRootError } from '@app/ui/components/form'
import { loginSchema, type LoginData, type LoginInput } from '../login.schema'
import { useLoginSubmit } from '../hooks/use-login-submit'

export function LoginForm() {
	const { onSubmit, isLoading, errors } = useLoginSubmit()

	const form = useForm<LoginInput, unknown, LoginData>({
		resolver: standardSchemaResolver(loginSchema),
		mode: 'onSubmit',
		reValidateMode: 'onChange',
		defaultValues: { email: '', password: '' },
		errors,
	})

	return (
		<form
			onSubmit={form.handleSubmit(onSubmit)}
			noValidate
			className="space-y-5"
		>
			<FormRootError
				title="Erreur lors de la connexion"
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
									disabled={isLoading}
									autoComplete="email"
								/>
							</div>
							{fieldState.error && <FieldError errors={[fieldState.error]} />}
						</Field>
					)}
				/>

				<Controller
					control={form.control}
					name="password"
					render={({ field, fieldState }) => (
						<Field className="gap-2" data-invalid={fieldState.invalid}>
							<FieldLabel htmlFor={field.name} className="text-sm font-medium">
								Mot de passe
							</FieldLabel>
							<div className="relative">
								<Lock className="text-muted-foreground/70 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
								<Input
									{...field}
									id={field.name}
									type="password"
									placeholder="Entrez votre mot de passe"
									className="h-10 rounded-lg pl-9"
									aria-invalid={fieldState.invalid}
									disabled={isLoading}
									autoComplete="current-password"
								/>
							</div>
							{fieldState.error && <FieldError errors={[fieldState.error]} />}
							<div className="flex justify-end">
								<Link
									to="/auth/forgot-password"
									className="text-muted-foreground hover:text-foreground text-xs transition-colors"
								>
									Mot de passe oublié ?
								</Link>
							</div>
						</Field>
					)}
				/>
			</FieldGroup>

			<Button
				type="submit"
				className="h-10 w-full rounded-lg text-sm font-medium"
				disabled={isLoading}
			>
				{isLoading ? (
					<>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						Connexion...
					</>
				) : (
					'Se connecter'
				)}
			</Button>
		</form>
	)
}
