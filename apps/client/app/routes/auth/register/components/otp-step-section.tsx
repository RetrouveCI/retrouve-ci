import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Controller, useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { useActionFetcher } from '@/shared/hooks/use-action-fetcher'
import { otpSchema, type OtpData, type OtpInput } from '../register.schema'
import { verifyPhoneOtp } from '../../helpers/phone-auth.client'
import { OtpStep } from '../../components/otp-step'
import type { action } from '../_index'

const OTP_EXPIRY_SECONDS = 120

interface OtpStepSectionProps {
	phoneNumber: string
	onVerified: () => void
}

export function OtpStepSection({
	phoneNumber,
	onVerified,
}: OtpStepSectionProps) {
	const [otpError, setOtpError] = useState(false)
	const [isVerifying, setIsVerifying] = useState(false)
	const [timeLeft, setTimeLeft] = useState(OTP_EXPIRY_SECONDS)
	const [resendKey, setResendKey] = useState(0)
	const [hasRequestedResend, setHasRequestedResend] = useState(false)

	const form = useForm<OtpInput, unknown, OtpData>({
		resolver: standardSchemaResolver(otpSchema),
		mode: 'onSubmit',
		reValidateMode: 'onChange',
		defaultValues: { otp: '' },
	})

	// The resend is a side mutation, not this form's submission: its outcome is
	// reported with a toast rather than through the form's own errors.
	const resendFetcher = useActionFetcher<typeof action>()

	useEffect(() => {
		if (!hasRequestedResend || resendFetcher.state !== 'idle') return

		if (resendFetcher.isOk) {
			toast.success('Nouveau code envoyé !')
			form.setValue('otp', '')
			setOtpError(false)
			setResendKey(k => k + 1)
		} else {
			toast.error('Impossible d’envoyer le code', {
				description: resendFetcher.errors?.root?.message,
			})
		}

		setHasRequestedResend(false)
	}, [
		hasRequestedResend,
		resendFetcher.state,
		resendFetcher.isOk,
		resendFetcher.errors,
		form,
	])

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

	const onSubmit = async (values: OtpData) => {
		setIsVerifying(true)
		const ok = await verifyPhoneOtp(phoneNumber, values.otp)
		setIsVerifying(false)
		if (!ok) {
			setOtpError(true)
			toast.error('Code incorrect', {
				description: 'Vérifiez le code reçu et réessayez.',
			})
			form.setValue('otp', '')
			return
		}
		onVerified()
	}

	const handleResend = () => {
		setHasRequestedResend(true)
		void resendFetcher.submit(
			{ intent: 'send-otp', phoneNumber },
			{ method: 'post' },
		)
	}

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} noValidate>
			<Controller
				control={form.control}
				name="otp"
				render={({ field }) => (
					<OtpStep
						otp={field.value}
						setOtp={field.onChange}
						otpError={otpError}
						setOtpError={setOtpError}
						timeLeft={timeLeft}
						isSubmitting={isVerifying || resendFetcher.isSubmitting}
						formatTime={formatTime}
						onResend={handleResend}
					/>
				)}
			/>
		</form>
	)
}
