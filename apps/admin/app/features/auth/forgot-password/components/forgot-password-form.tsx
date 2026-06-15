import { useEffect } from 'react'
import { useFetcher } from 'react-router'
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

	useEffect(() => {
		if (fetcher.state !== 'idle' || !fetcher.data) return

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

	const emailControl = useInputControl(fields.email)

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
							autoFocus
						/>
					</div>
					<FieldError errors={fields.email.errors} />
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
						Envoi en cours...
					</>
				) : (
					'Envoyer les instructions'
				)}
			</Button>
		</form>
	)
}
