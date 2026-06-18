import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Button, Input } from '@retrouve-ci/ui/components'
import { InputLabel, FieldError } from '@retrouve-ci/ui/components/form'
import { useForm, getFormProps, getInputProps } from '@conform-to/react'
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

	return (
		<form {...getFormProps(form)} className="space-y-5">
			<div className="space-y-4">
				<div className="space-y-2">
					<InputLabel htmlFor={fields.email.id} className="text-sm font-medium">
						Email
					</InputLabel>
					<div className="relative">
						<Mail className="text-muted-foreground/70 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
						<Input
							{...getInputProps(fields.email, { type: 'email' })}
							key={fields.email.key}
							placeholder="admin@retrouveci.com"
							className="h-10 rounded-lg pl-9"
							disabled={isSubmitting}
						/>
					</div>
					<FieldError errors={fields.email.errors} />
				</div>

				<div className="space-y-2">
					<InputLabel
						htmlFor={fields.password.id}
						className="text-sm font-medium"
					>
						Mot de passe
					</InputLabel>
					<div className="relative">
						<Lock className="text-muted-foreground/70 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
						<Input
							{...getInputProps(fields.password, { type: 'password' })}
							key={fields.password.key}
							placeholder="Entrez votre mot de passe"
							className="h-10 rounded-lg pl-9"
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
				</div>
			</div>

			<Button
				type="submit"
				className="h-10 w-full rounded-lg text-sm font-medium"
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
