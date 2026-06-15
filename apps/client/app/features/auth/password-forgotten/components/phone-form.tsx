import { useEffect, useState } from 'react'
import { useFetcher, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { useForm, useInputControl, getFormProps } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { phoneNumberSchema } from '../password-forgotten.schema'
import { PhoneStep } from '../../components/phone-step'

interface ActionResult {
	ok: boolean
	error?: string
}

export function PhoneForm() {
	const navigate = useNavigate()
	const fetcher = useFetcher<ActionResult>()
	const [submittedPhone, setSubmittedPhone] = useState<string | null>(null)

	useEffect(() => {
		if (fetcher.state !== 'idle' || !fetcher.data || !submittedPhone) return

		if (fetcher.data.ok) {
			toast.success('Code envoyé !', {
				description: 'Vérifiez vos SMS ou WhatsApp.',
			})

			navigate(
				`/auth/reset-password?phone=${encodeURIComponent(submittedPhone)}`,
			)
		} else {
			toast.error('Impossible d’envoyer le code', {
				description: fetcher.data.error,
			})
		}
		setSubmittedPhone(null)
	}, [fetcher.state, fetcher.data, submittedPhone, navigate])

	const [form, fields] = useForm({
		id: 'password-forgotten-form',
		constraint: getZodConstraint(phoneNumberSchema),
		shouldValidate: 'onSubmit',
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: phoneNumberSchema })
		},
		onSubmit(event, { submission, formData }) {
			event.preventDefault()

			if (submission?.status !== 'success') return

			setSubmittedPhone(submission.value.phoneNumber)
			void fetcher.submit(formData, { method: 'post' })
		},
	})

	const phoneControl = useInputControl(fields.phoneNumber)
	const isSubmitting = fetcher.state !== 'idle'

	return (
		<form {...getFormProps(form)}>
			<PhoneStep
				phoneNumber={phoneControl.value ?? ''}
				setPhoneNumber={phoneControl.change}
				errors={fields.phoneNumber.errors}
				isSubmitting={isSubmitting}
				hint="Entrez votre numéro pour recevoir un code de vérification."
				submitLabel="Envoyer le code"
			/>
		</form>
	)
}
