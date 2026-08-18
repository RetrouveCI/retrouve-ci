import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Loader2 } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { toErrorList } from '../../lib/field-errors'
import { useAuth } from '@/context/auth'
import { withRedirect } from '@/shared/helpers/redirect'
import { Button, Input, Label } from '@app/ui/components'
import { FieldError } from '@app/ui/components/form'
import { loginSchema, type LoginData, type LoginInput } from '../login.schema'
import { PasswordInput } from '../../components/password-input'

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
			className="space-y-5"
		>
			<Controller
				control={form.control}
				name="phoneNumber"
				render={({ field, fieldState }) => (
					<div className="space-y-2">
						<Label htmlFor="phone" className="text-sm font-medium">
							Numéro de téléphone
						</Label>
						<div className="flex gap-2">
							<div className="bg-muted/50 text-muted-foreground flex h-12 shrink-0 items-center rounded-xl border-2 px-4 text-sm font-medium">
								<img
									src="/logo.png"
									alt=""
									width={18}
									height={18}
									className="mr-2 rounded-sm"
								/>
								+225
							</div>
							<Input
								{...field}
								id="phone"
								type="tel"
								placeholder="07 XX XX XX XX"
								className="border-border bg-background focus:border-primary-green focus:ring-primary-green/20 h-12 flex-1 rounded-xl border-2 transition-all focus:ring-2"
								autoComplete="tel"
								autoFocus
							/>
						</div>
						<FieldError errors={toErrorList(fieldState.error)} />
					</div>
				)}
			/>

			<div className="space-y-1">
				<Controller
					control={form.control}
					name="password"
					render={({ field, fieldState }) => (
						<>
							<PasswordInput
								id="password"
								name={field.name}
								label="Mot de passe"
								value={field.value}
								onChange={field.onChange}
								placeholder="••••••••"
								disabled={isSubmitting}
							/>
							<FieldError errors={toErrorList(fieldState.error)} />
						</>
					)}
				/>
				{authError && <p className="text-destructive text-xs">{authError}</p>}
				<div className="flex justify-end pt-1">
					<Link
						to="/auth/password-forgotten"
						className="text-muted-foreground hover:text-foreground text-xs transition-colors"
					>
						Mot de passe oublié ?
					</Link>
				</div>
			</div>

			<Button
				type="submit"
				className="bg-primary-green hover:bg-primary-green-dark h-12 w-full rounded-xl text-base font-semibold text-white transition-all hover:scale-[1.02]"
				disabled={isSubmitting}
			>
				{isSubmitting ? (
					<>
						<Loader2 className="h-4 w-4 animate-spin" /> Connexion...
					</>
				) : (
					'Se connecter'
				)}
			</Button>

			<p className="text-muted-foreground text-center text-sm">
				Pas encore de compte ?{' '}
				<Link
					to={withRedirect('/auth/register', redirectTo)}
					className="text-primary-green font-semibold hover:underline"
				>
					Créer un compte
				</Link>
			</p>
		</form>
	)
}
