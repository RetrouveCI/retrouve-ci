import { useEffect, useRef } from 'react'
import { useFetcher } from 'react-router'
import { Button, Input } from '@retrouve-ci/ui/components'
import { InputLabel, FieldError } from '@retrouve-ci/ui/components/form'
import { useForm, getFormProps, getInputProps } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { Loader2, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { forgotPasswordSchema } from '../forgot-password.schema'

interface ActionResult {
	ok: boolean
	error?: string
}

export function ForgotPasswordForm() {
	const fetcher = useFetcher<ActionResult>()
	const isSubmitting = fetcher.state !== 'idle'
	const processedRef = useRef<ActionResult | undefined>(undefined)

	useEffect(() => {
		if (fetcher.state !== 'idle' || !fetcher.data) return
		if (fetcher.data === processedRef.current) return
		processedRef.current = fetcher.data

		if (fetcher.data.ok) {
			toast.success('Instructions envoyées', {
				description:
					'Si cet email est enregistré, vous recevrez les instructions de réinitialisation.',
			})
		} else {
			toast.error('Impossible d’envoyer les instructions', {
				description: fetcher.data.error,
			})
		}
	}, [fetcher.state, fetcher.data])

	const [form, fields] = useForm({
		id: 'forgot-password-form',
		constraint: getZodConstraint(forgotPasswordSchema),
		shouldValidate: 'onSubmit',
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: forgotPasswordSchema })
		},
		onSubmit(event, { submission, formData }) {
			event.preventDefault()
			if (submission?.status !== 'success') return
			void fetcher.submit(formData, { method: 'post' })
		},
	})

	return (
		<form {...getFormProps(form)} className="space-y-5">
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
						autoFocus
					/>
				</div>
				<FieldError errors={fields.email.errors} />
			</div>

			<Button
				type="submit"
				className="h-10 w-full rounded-lg text-sm font-medium"
				disabled={isSubmitting}
			>
				{isSubmitting ? (
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
