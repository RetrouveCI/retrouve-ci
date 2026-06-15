import { useState, useEffect } from 'react'
import { useFetcher } from 'react-router'
import { toast } from 'sonner'
import { useForm, useInputControl, getFormProps } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { otpSchema } from '../reset-password.schema'
import { OtpStep } from '../../components/otp-step'

const OTP_EXPIRY_SECONDS = 120

interface ResendActionResult {
	ok: boolean
	error?: string
}

interface OtpStepSectionProps {
	phoneNumber: string
	initialError?: boolean
	onVerified: (otp: string) => void
}

export function OtpStepSection({
	phoneNumber,
	initialError = false,
	onVerified,
}: OtpStepSectionProps) {
	const resendFetcher = useFetcher<ResendActionResult>()
	const [otpError, setOtpError] = useState(initialError)
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

	useEffect(() => {
		if (resendFetcher.state !== 'idle' || !resendFetcher.data) return

		if (resendFetcher.data.ok) {
			toast.success('Nouveau code envoyé !')
			otpControl.change('')
			setOtpError(false)
			setResendKey(k => k + 1)
		} else {
			toast.error('Impossible d’envoyer le code', {
				description: resendFetcher.data.error,
			})
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [resendFetcher.state, resendFetcher.data])

	const formatTime = (s: number) =>
		`${Math.floor(s / 60)
			.toString()
			.padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

	const [form, fields] = useForm({
		id: 'reset-password-otp-form',
		constraint: getZodConstraint(otpSchema),
		shouldValidate: 'onSubmit',
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: otpSchema })
		},
		onSubmit(event, { submission }) {
			event.preventDefault()
			if (submission?.status !== 'success') return
			onVerified(submission.value.otp)
		},
	})
	const otpControl = useInputControl(fields.otp)

	const handleResend = () => {
		void resendFetcher.submit(
			{ intent: 'resend-otp', phoneNumber },
			{ method: 'post' },
		)
	}

	return (
		<form {...getFormProps(form)}>
			<OtpStep
				otp={otpControl.value ?? ''}
				setOtp={otpControl.change}
				otpError={otpError}
				setOtpError={setOtpError}
				timeLeft={timeLeft}
				isSubmitting={resendFetcher.state !== 'idle'}
				formatTime={formatTime}
				onResend={handleResend}
			/>
		</form>
	)
}
