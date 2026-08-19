import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Controller, useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { useActionFetcher } from '@/shared/hooks/use-action-fetcher'
import {
	otpSchema,
	type OtpData,
	type OtpInput,
} from '../reset-password.schema'
import { OtpStep } from '../../components/otp-step'
import type { action } from '../_index'

const OTP_EXPIRY_SECONDS = 120

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
	const [otpError, setOtpError] = useState(initialError)
	const [timeLeft, setTimeLeft] = useState(OTP_EXPIRY_SECONDS)
	const [resendKey, setResendKey] = useState(0)
	const [hasRequestedResend, setHasRequestedResend] = useState(false)

	const form = useForm<OtpInput, unknown, OtpData>({
		resolver: standardSchemaResolver(otpSchema),
		mode: 'onSubmit',
		reValidateMode: 'onChange',
		defaultValues: { otp: '' },
	})

	// This form never submits to the action — the OTP is checked one step later,
	// together with the new password. Only the resend talks to the server, and it
	// reports through a toast.
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

	const handleResend = () => {
		setHasRequestedResend(true)
		void resendFetcher.submit(
			{ intent: 'resend-otp', phoneNumber },
			{ method: 'post' },
		)
	}

	return (
		<form
			onSubmit={form.handleSubmit(values => onVerified(values.otp))}
			noValidate
		>
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
						isSubmitting={resendFetcher.isSubmitting}
						formatTime={formatTime}
						onResend={handleResend}
					/>
				)}
			/>
		</form>
	)
}
