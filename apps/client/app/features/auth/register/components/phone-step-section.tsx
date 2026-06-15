import { useState } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { useForm, useInputControl, getFormProps } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { phoneNumberSchema } from '../register.schema'
import { sendPhoneOtp } from '../../lib/phone-auth.client'
import { PhoneStep } from '../../components/phone-step'

interface PhoneStepSectionProps {
	onVerified: (phoneNumber: string) => void
}

export function PhoneStepSection({ onVerified }: PhoneStepSectionProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handlePhoneSubmit = async (value: string) => {
		setIsSubmitting(true)
		const ok = await sendPhoneOtp(value)
		setIsSubmitting(false)
		if (!ok) {
			toast.error('Impossible d’envoyer le code', {
				description: 'Vérifiez le numéro et réessayez.',
			})
			return
		}

		toast.success('Code envoyé !', {
			description: 'Vérifiez vos SMS ou WhatsApp.',
		})
		onVerified(value)
	}

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
			void handlePhoneSubmit(submission.value.phoneNumber)
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
					isSubmitting={isSubmitting}
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
