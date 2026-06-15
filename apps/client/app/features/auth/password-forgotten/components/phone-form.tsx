import { useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { useForm, useInputControl, getFormProps } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { phoneNumberSchema } from '../password-forgotten.schema'
import { requestPhonePasswordReset } from '../../lib/phone-auth.client'
import { PhoneStep } from '../../components/phone-step'

export function PhoneForm() {
	const navigate = useNavigate()
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handlePhoneSubmit = async (value: string) => {
		setIsSubmitting(true)

		await requestPhonePasswordReset(value)
		setIsSubmitting(false)
		toast.success('Code envoyé !', {
			description: 'Vérifiez vos SMS ou WhatsApp.',
		})

		navigate(`/auth/reset-password?phone=${encodeURIComponent(value)}`)
	}

	const [form, fields] = useForm({
		id: 'password-forgotten-form',
		constraint: getZodConstraint(phoneNumberSchema),
		shouldValidate: 'onSubmit',
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: phoneNumberSchema })
		},
		onSubmit(event, { submission }) {
			event.preventDefault()
			if (submission?.status !== 'success') return
			void handlePhoneSubmit(submission.value.phoneNumber)
		},
	})

	const phoneControl = useInputControl(fields.phoneNumber)

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
