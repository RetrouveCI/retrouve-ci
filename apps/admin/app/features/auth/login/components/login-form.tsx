import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import {
	Button,
	Field,
	FieldGroup,
	FieldLabel,
	Input,
} from '@retrouve-ci/ui/components'
import { FieldError } from '@retrouve-ci/ui/components/form'
import { useForm, useInputControl, getFormProps } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { Loader2, Lock, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/shared/auth/auth-context'
import { loginSchema } from '../login.schema'

export function LoginForm() {
	const navigate = useNavigate()
	const { login } = useAuth()
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleLogin = async (value: { email: string; password: string }) => {
		setIsSubmitting(true)
		const result = await login(value.email, value.password)

		if (result.success) {
			toast.success('Connexion réussie')
			navigate('/')
		} else {
			toast.error(result.error ?? 'Email ou mot de passe incorrect')
		}

		setIsSubmitting(false)
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

	const emailControl = useInputControl(fields.email)
	const passwordControl = useInputControl(fields.password)

	return (
		<form {...getFormProps(form)} className="space-y-5">
			<FieldGroup>
				<Field>
					<FieldLabel htmlFor="email" className="text-sm font-medium">
						Email
					</FieldLabel>
					<div className="relative">
						<Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
						<Input
							id="email"
							name="email"
							type="email"
							placeholder="admin@retrouveci.com"
							className="h-11 rounded-xl pl-10"
							value={emailControl.value ?? ''}
							onChange={e => emailControl.change(e.target.value)}
							disabled={isSubmitting}
						/>
					</div>
					<FieldError errors={fields.email.errors} />
				</Field>

				<Field>
					<FieldLabel htmlFor="password" className="text-sm font-medium">
						Mot de passe
					</FieldLabel>
					<div className="relative">
						<Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
						<Input
							id="password"
							name="password"
							type="password"
							placeholder="Entrez votre mot de passe"
							className="h-11 rounded-xl pl-10"
							value={passwordControl.value ?? ''}
							onChange={e => passwordControl.change(e.target.value)}
							disabled={isSubmitting}
						/>
					</div>
					<FieldError errors={fields.password.errors} />
					<div className="flex justify-end">
						<Link
							to="/auth/forgot-password"
							className="text-muted-foreground hover:text-foreground text-xs transition-colors"
						>
							Mot de passe oublié ?
						</Link>
					</div>
				</Field>
			</FieldGroup>

			<Button
				type="submit"
				className="shadow-primary/25 h-11 w-full rounded-xl text-base font-medium shadow-lg"
				disabled={isSubmitting}
			>
				{isSubmitting ? (
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
