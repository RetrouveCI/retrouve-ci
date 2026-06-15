import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useForm, useInputControl, getFormProps } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { phoneNumberSchema } from '../auth.schema'
import { requestPhonePasswordReset } from '../lib/phone-auth.client'
import { PhoneStep } from '../components/phone-step'

export default function PasswordForgottenPage() {
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
		<>
			<div className="mb-6">
				<Link
					to="/auth/login"
					className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
				>
					<ArrowLeft className="h-4 w-4" />
					Retour
				</Link>
			</div>

			<div className="mb-8">
				<h2 className="mb-2 text-2xl font-bold lg:text-3xl">
					Mot de passe oublié
				</h2>
				<p className="text-muted-foreground">
					Réinitialisez votre mot de passe.
				</p>
			</div>

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

			<p className="text-muted-foreground mt-6 text-center text-sm">
				Retour à{' '}
				<Link
					to="/auth/login"
					className="text-primary-green font-semibold hover:underline"
				>
					la connexion
				</Link>
			</p>
		</>
	)
}
