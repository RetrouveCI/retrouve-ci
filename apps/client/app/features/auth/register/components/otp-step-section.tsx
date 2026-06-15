import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useForm, useInputControl, getFormProps } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { otpSchema } from '../register.schema'
import { sendPhoneOtp, verifyPhoneOtp } from '../../lib/phone-auth.client'
import { OtpStep } from '../../components/otp-step'

const OTP_EXPIRY_SECONDS = 120

interface OtpStepSectionProps {
	phoneNumber: string
	onVerified: () => void
}

export function OtpStepSection({ phoneNumber, onVerified }: OtpStepSectionProps) {
	const [otpError, setOtpError] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [timeLeft, setTimeLeft] = useState(OTP_EXPIRY_SECONDS)
	const [resendKey, setResendKey] = useState(0)

	useEffect(() => {
		setTimeLeft(OTP_EXPIRY_SECONDS)
		const interval = setInterval(() => {
			setTimeLeft(prev => {
				if (prev <= 1) {
					clearInterval(interval)
					return 0
				}
				return prev - 1
			})
		}, 1000)
		return () => clearInterval(interval)
	}, [resendKey])

	const formatTime = (s: number) =>
		`${Math.floor(s / 60)
			.toString()
			.padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

	const handleOtpSubmit = async (value: string) => {
		setIsSubmitting(true)
		const ok = await verifyPhoneOtp(phoneNumber, value)
		setIsSubmitting(false)
		if (!ok) {
			setOtpError(true)
			toast.error('Code incorrect', {
				description: 'Vérifiez le code reçu et réessayez.',
			})
			otpControl.change('')
			return
		}
		onVerified()
	}

	const [form, fields] = useForm({
		id: 'register-otp-form',
		constraint: getZodConstraint(otpSchema),
		shouldValidate: 'onSubmit',
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: otpSchema })
		},
		onSubmit(event, { submission }) {
			event.preventDefault()
			if (submission?.status !== 'success') return
			void handleOtpSubmit(submission.value.otp)
		},
	})
	const otpControl = useInputControl(fields.otp)

	const handleResend = async () => {
		setIsSubmitting(true)
		const ok = await sendPhoneOtp(phoneNumber)
		setIsSubmitting(false)
		if (!ok) {
			toast.error('Impossible d’envoyer le code')
			return
		}
		toast.success('Nouveau code envoyé !')
		otpControl.change('')
		setOtpError(false)
		setResendKey(k => k + 1)
	}

	return (
		<form {...getFormProps(form)}>
			<OtpStep
				otp={otpControl.value ?? ''}
				setOtp={otpControl.change}
				otpError={otpError}
				setOtpError={setOtpError}
				timeLeft={timeLeft}
				isSubmitting={isSubmitting}
				formatTime={formatTime}
				onResend={handleResend}
			/>
		</form>
	)
}
