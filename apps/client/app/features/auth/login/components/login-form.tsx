import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Loader2 } from 'lucide-react'
import { useForm, useInputControl, getFormProps } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { useAuth } from '@/shared/auth/auth-context'
import { withRedirect } from '@/shared/auth/redirect'
import { Button, Input, Label } from '@retrouve-ci/ui/components'
import { FieldError } from '@retrouve-ci/ui/components/form'
import { loginSchema } from '../login.schema'
import { PasswordInput } from '../../components/password-input'

export function LoginForm({ redirectTo }: { redirectTo: string }) {
	const navigate = useNavigate()
	const { login } = useAuth()

	const [authError, setAuthError] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleLogin = async (value: {
		phoneNumber: string
		password: string
	}) => {
		setAuthError('')
		setIsSubmitting(true)
		const result = await login(value.phoneNumber, value.password)
		if (!result.success) {
			setAuthError(result.error ?? 'Mot de passe incorrect.')
			setIsSubmitting(false)
			return
		}
		navigate(redirectTo, { replace: true })
	}

	const [form, fields] = useForm({
		id: 'login-form',
		constraint: getZodConstraint(loginSchema),
		shouldValidate: 'onSubmit',
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: loginSchema })
		},
		onSubmit(event, { submission }) {
			event.preventDefault()
			if (submission?.status !== 'success') return
			void handleLogin(submission.value)
		},
	})
	const phoneControl = useInputControl(fields.phoneNumber)
	const passwordControl = useInputControl(fields.password)

	return (
		<form {...getFormProps(form)} className="space-y-5">
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
						id="phone"
						name="phoneNumber"
						type="tel"
						placeholder="07 XX XX XX XX"
						value={phoneControl.value ?? ''}
						onChange={e => phoneControl.change(e.target.value)}
						className="border-border bg-background focus:border-primary-green focus:ring-primary-green/20 h-12 flex-1 rounded-xl border-2 transition-all focus:ring-2"
						autoComplete="tel"
						autoFocus
					/>
				</div>
				<FieldError errors={fields.phoneNumber.errors} />
			</div>

			<div className="space-y-1">
				<PasswordInput
					id="password"
					name="password"
					label="Mot de passe"
					value={passwordControl.value ?? ''}
					onChange={passwordControl.change}
					placeholder="••••••••"
					disabled={isSubmitting}
				/>
				<FieldError errors={fields.password.errors} />
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
