import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Controller, useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { toErrorList } from '../../helpers/field-errors'
import { useAuth } from '@/context/auth'
import { withRedirect } from '@/shared/helpers/redirect'
import { Input, Label } from '@app/ui/components'
import { FieldError } from '@app/ui/components/form'
import { loginSchema, type LoginData, type LoginInput } from '../login.schema'
import { AuthSubmitButton } from '../../components/auth-submit-button'
import { PasswordInput } from '../../components/password-input'
import { IvorianFlag } from '../../components/ivorian-flag'

export function LoginForm({ redirectTo }: { redirectTo: string }) {
	const navigate = useNavigate()
	const { login } = useAuth()

	const [authError, setAuthError] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	const form = useForm<LoginInput, unknown, LoginData>({
		resolver: standardSchemaResolver(loginSchema),
		mode: 'onSubmit',
		reValidateMode: 'onChange',
		defaultValues: { phoneNumber: '', password: '' },
	})

	const onSubmit = async (values: LoginData) => {
		setAuthError('')
		setIsSubmitting(true)
		const result = await login(values.phoneNumber, values.password)
		if (!result.success) {
			setAuthError(result.error ?? 'Mot de passe incorrect.')
			setIsSubmitting(false)
			return
		}
		navigate(redirectTo, { replace: true })
	}

	return (
		<form
			onSubmit={form.handleSubmit(onSubmit)}
			noValidate
			className="space-y-6"
		>
			<Controller
				control={form.control}
				name="phoneNumber"
				render={({ field, fieldState }) => (
					<div className="space-y-2">
						<Label htmlFor="phone" className="text-sm font-semibold">
							Numéro de téléphone
						</Label>
						<div className="flex gap-2.5">
							<div className="bg-muted/50 text-foreground flex h-13 shrink-0 items-center gap-2 rounded-xl border-[1.5px] px-3.5 text-sm font-semibold">
								<IvorianFlag className="h-3.5 w-5 rounded-[2px] ring-1 ring-black/10" />
								+225
							</div>
							<Input
								{...field}
								id="phone"
								type="tel"
								inputMode="numeric"
								maxLength={14}
								placeholder="07 00 00 00 00"
								className="border-border bg-background focus:border-primary-green focus:ring-primary-green/15 h-13 flex-1 rounded-xl border-[1.5px] text-[17px] tracking-[0.05em] tabular-nums transition-all focus:ring-[3px]"
								autoComplete="tel"
								autoFocus
							/>
						</div>
						<FieldError errors={toErrorList(fieldState.error)} />
					</div>
				)}
			/>

			<Controller
				control={form.control}
				name="password"
				render={({ field, fieldState }) => (
					<div className="space-y-2">
						<PasswordInput
							id="password"
							name={field.name}
							label="Mot de passe"
							value={field.value}
							onChange={field.onChange}
							disabled={isSubmitting}
							action={
								<Link
									to={withRedirect('/password-forgotten', redirectTo)}
									className="text-primary-green text-xs font-semibold hover:underline"
								>
									Oublié ?
								</Link>
							}
						/>
						<FieldError errors={toErrorList(fieldState.error)} />
						{authError && (
							<p className="text-destructive text-xs">{authError}</p>
						)}
					</div>
				)}
			/>

			<AuthSubmitButton isSubmitting={isSubmitting} pendingLabel="Connexion...">
				Se connecter
			</AuthSubmitButton>

			<div className="flex items-center gap-3">
				<span className="bg-border h-px flex-1" />
				<span className="text-muted-foreground text-xs">
					pas encore de compte ?
				</span>
				<span className="bg-border h-px flex-1" />
			</div>

			<Link
				to={withRedirect('/register', redirectTo)}
				className="hover:bg-muted/50 flex h-13 w-full items-center justify-center rounded-[14px] border-[1.5px] text-[15px] font-semibold transition-colors"
			>
				Créer un compte
			</Link>
		</form>
	)
}
