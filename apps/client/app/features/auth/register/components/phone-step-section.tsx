import { useEffect, useState } from 'react'
import { Link, useFetcher } from 'react-router'
import { toast } from 'sonner'
import { useForm, useInputControl, getFormProps } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { phoneNumberSchema } from '../register.schema'
import { PhoneStep } from '../../components/phone-step'

interface ActionResult {
	ok: boolean
	error?: string
}

interface PhoneStepSectionProps {
	onVerified: (phoneNumber: string) => void
}

export function PhoneStepSection({ onVerified }: PhoneStepSectionProps) {
	const fetcher = useFetcher<ActionResult>()
	const [submittedPhone, setSubmittedPhone] = useState<string | null>(null)

	useEffect(() => {
		if (fetcher.state !== 'idle' || !fetcher.data || !submittedPhone) return

		if (fetcher.data.ok) {
			toast.success('Code envoyé !', {
				description: 'Vérifiez vos SMS ou WhatsApp.',
			})
			onVerified(submittedPhone)
		} else {
			toast.error('Impossible d’envoyer le code', {
				description: 'Vérifiez le numéro et réessayez.',
			})
		}
		setSubmittedPhone(null)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fetcher.state, fetcher.data, submittedPhone])

	const [form, fields] = useForm({
		id: 'register-phone-form',
		constraint: getZodConstraint(phoneNumberSchema),
		shouldValidate: 'onSubmit',
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: phoneNumberSchema })
		},
		onSubmit(event, { submission }) {
			event.preventDefault()
			if (submission?.status !== 'success') return
			setSubmittedPhone(submission.value.phoneNumber)
			void fetcher.submit(
				{ intent: 'send-otp', phoneNumber: submission.value.phoneNumber },
				{ method: 'post' },
			)
		},
	})
	const phoneControl = useInputControl(fields.phoneNumber)

	return (
		<>
			<form {...getFormProps(form)}>
				<PhoneStep
					phoneNumber={phoneControl.value ?? ''}
					setPhoneNumber={phoneControl.change}
					errors={fields.phoneNumber.errors}
					isSubmitting={fetcher.state !== 'idle'}
				/>
			</form>
			<p className="text-muted-foreground mt-6 text-center text-sm">
				Déjà un compte ?{' '}
				<Link
					to="/auth/login"
					className="text-primary-green font-semibold hover:underline"
				>
					Se connecter
				</Link>
			</p>
		</>
	)
}
