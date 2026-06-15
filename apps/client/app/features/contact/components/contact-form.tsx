import { useEffect, useState } from 'react'
import { useFetcher } from 'react-router'
import { toast } from 'sonner'
import { Send, CheckCircle2 } from 'lucide-react'
import { useForm, useInputControl, getFormProps } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { FieldError } from '@retrouve-ci/ui/components/form'
import { contactSchema } from '../contact.schema'

interface ActionResult {
	ok: boolean
	error?: string
}

export function ContactForm() {
	const fetcher = useFetcher<ActionResult>()
	const [submitted, setSubmitted] = useState(false)

	useEffect(() => {
		if (fetcher.state !== 'idle' || !fetcher.data) return

		if (fetcher.data.ok) {
			setSubmitted(true)
		} else {
			toast.error('Impossible d’envoyer le message', {
				description: fetcher.data.error,
			})
		}
	}, [fetcher.state, fetcher.data])

	const [form, fields] = useForm({
		id: 'contact-form',
		constraint: getZodConstraint(contactSchema),
		shouldValidate: 'onSubmit',
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: contactSchema })
		},
		onSubmit(event, { submission, formData }) {
			event.preventDefault()
			if (submission?.status !== 'success') return
			void fetcher.submit(formData, { method: 'post' })
		},
	})

	const nameControl = useInputControl(fields.name)
	const emailControl = useInputControl(fields.email)
	const subjectControl = useInputControl(fields.subject)
	const messageControl = useInputControl(fields.message)
	const isSubmitting = fetcher.state !== 'idle'

	if (submitted) {
		return (
			<div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
				<div className="bg-primary-green/10 flex h-16 w-16 items-center justify-center rounded-full">
					<CheckCircle2 className="text-primary-green h-8 w-8" />
				</div>
				<div>
					<p className="mb-1 text-lg font-semibold">Message envoyé !</p>
					<p className="text-muted-foreground text-sm">
						Nous vous répondrons dans les 24 heures.
					</p>
				</div>
				<button
					onClick={() => {
						setSubmitted(false)
						form.reset()
					}}
					className="text-primary-green text-sm hover:underline"
				>
					Envoyer un autre message
				</button>
			</div>
		)
	}

	return (
		<form {...getFormProps(form)} className="space-y-4">
			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-1.5">
					<label className="text-sm font-medium">Nom complet</label>
					<input
						type="text"
						placeholder="Konan Yao"
						value={nameControl.value ?? ''}
						onChange={e => nameControl.change(e.target.value)}
						className="bg-muted/30 focus:border-primary-green/50 focus:ring-primary-green/30 h-11 w-full rounded-xl border px-4 text-sm transition-all outline-none focus:ring-2"
					/>
					<FieldError errors={fields.name.errors} />
				</div>
				<div className="space-y-1.5">
					<label className="text-sm font-medium">Email</label>
					<input
						type="email"
						placeholder="vous@exemple.ci"
						value={emailControl.value ?? ''}
						onChange={e => emailControl.change(e.target.value)}
						className="bg-muted/30 focus:border-primary-green/50 focus:ring-primary-green/30 h-11 w-full rounded-xl border px-4 text-sm transition-all outline-none focus:ring-2"
					/>
					<FieldError errors={fields.email.errors} />
				</div>
			</div>
			<div className="space-y-1.5">
				<label className="text-sm font-medium">Sujet</label>
				<input
					type="text"
					placeholder="Comment pouvons-nous vous aider ?"
					value={subjectControl.value ?? ''}
					onChange={e => subjectControl.change(e.target.value)}
					className="bg-muted/30 focus:border-primary-green/50 focus:ring-primary-green/30 h-11 w-full rounded-xl border px-4 text-sm transition-all outline-none focus:ring-2"
				/>
				<FieldError errors={fields.subject.errors} />
			</div>
			<div className="space-y-1.5">
				<label className="text-sm font-medium">Message</label>
				<textarea
					rows={5}
					placeholder="Décrivez votre demande..."
					value={messageControl.value ?? ''}
					onChange={e => messageControl.change(e.target.value)}
					className="bg-muted/30 focus:border-primary-green/50 focus:ring-primary-green/30 w-full resize-none rounded-xl border px-4 py-3 text-sm transition-all outline-none focus:ring-2"
				/>
				<FieldError errors={fields.message.errors} />
			</div>
			<button
				type="submit"
				disabled={isSubmitting}
				className="bg-primary-green hover:bg-primary-green-dark flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-70"
			>
				<Send className="h-4 w-4" />
				{isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
			</button>
		</form>
	)
}
