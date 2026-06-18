import { useEffect, useRef, useState } from 'react'
import { useFetcher, useNavigate } from 'react-router'
import { Button, Input } from '@retrouve-ci/ui/components'
import { InputLabel, FieldError } from '@retrouve-ci/ui/components/form'
import { useForm, getFormProps, getInputProps } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { Loader2, Lock, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { resetPasswordSchema } from '../reset-password.schema'

interface ActionResult {
	ok: boolean
	error?: string
}

export function ResetPasswordForm({ token }: { token: string }) {
	const fetcher = useFetcher<ActionResult>()
	const navigate = useNavigate()
	const isSubmitting = fetcher.state !== 'idle'
	const [showNew, setShowNew] = useState(false)
	const [showConfirm, setShowConfirm] = useState(false)
	const processedRef = useRef<ActionResult | undefined>(undefined)

	useEffect(() => {
		if (fetcher.state !== 'idle' || !fetcher.data) return
		if (fetcher.data === processedRef.current) return
		processedRef.current = fetcher.data

		if (fetcher.data.ok) {
			toast.success('Mot de passe réinitialisé !', {
				description:
					'Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.',
			})
			void navigate('/auth/login')
		} else {
			toast.error('Impossible de réinitialiser le mot de passe', {
				description: 'Le lien est invalide ou a expiré.',
			})
		}
	}, [fetcher.state, fetcher.data, navigate])

	const [form, fields] = useForm({
		id: 'reset-password-form',
		constraint: getZodConstraint(resetPasswordSchema),
		shouldValidate: 'onSubmit',
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: resetPasswordSchema })
		},
		onSubmit(event, { submission, formData }) {
			event.preventDefault()
			if (submission?.status !== 'success') return
			void fetcher.submit(formData, { method: 'post' })
		},
	})

	return (
		<form {...getFormProps(form)} className="space-y-5">
			<input type="hidden" name="token" value={token} />

			<div className="space-y-4">
				<div className="space-y-2">
					<InputLabel
						htmlFor={fields.newPassword.id}
						className="text-sm font-medium"
					>
						Nouveau mot de passe
					</InputLabel>
					<div className="relative">
						<Lock className="text-muted-foreground/70 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
						<Input
							{...getInputProps(fields.newPassword, {
								type: showNew ? 'text' : 'password',
							})}
							key={fields.newPassword.key}
							placeholder="Minimum 8 caractères"
							className="h-10 rounded-lg pr-10 pl-9"
							disabled={isSubmitting}
							autoFocus
						/>
						<button
							type="button"
							onClick={() => setShowNew(v => !v)}
							className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 p-1 transition-colors"
							tabIndex={-1}
						>
							{showNew ? (
								<EyeOff className="h-4 w-4" />
							) : (
								<Eye className="h-4 w-4" />
							)}
						</button>
					</div>
					<FieldError errors={fields.newPassword.errors} />
					<p className="text-muted-foreground text-xs">
						Min. 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
					</p>
				</div>

				<div className="space-y-2">
					<InputLabel
						htmlFor={fields.confirmPassword.id}
						className="text-sm font-medium"
					>
						Confirmer le mot de passe
					</InputLabel>
					<div className="relative">
						<Lock className="text-muted-foreground/70 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
						<Input
							{...getInputProps(fields.confirmPassword, {
								type: showConfirm ? 'text' : 'password',
							})}
							key={fields.confirmPassword.key}
							placeholder="••••••••"
							className="h-10 rounded-lg pr-10 pl-9"
							disabled={isSubmitting}
						/>
						<button
							type="button"
							onClick={() => setShowConfirm(v => !v)}
							className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 p-1 transition-colors"
							tabIndex={-1}
						>
							{showConfirm ? (
								<EyeOff className="h-4 w-4" />
							) : (
								<Eye className="h-4 w-4" />
							)}
						</button>
					</div>
					<FieldError errors={fields.confirmPassword.errors} />
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
						Réinitialisation...
					</>
				) : (
					'Réinitialiser le mot de passe'
				)}
			</Button>
		</form>
	)
}
