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
import { useOtpCountdown } from '../../hooks/use-otp-countdown'
import type { action } from '../_index'

interface OtpStepSectionProps {
	phoneNumber: string
	initialError?: boolean
	onVerified: (otp: string) => void
	onEditPhone: () => void
}

export function OtpStepSection({
	phoneNumber,
	initialError = false,
	onVerified,
	onEditPhone,
}: OtpStepSectionProps) {
	const [otpError, setOtpError] = useState(initialError)
	const [hasRequestedResend, setHasRequestedResend] = useState(false)

	const countdown = useOtpCountdown()

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

	const { restart } = countdown

	useEffect(() => {
		if (!hasRequestedResend || resendFetcher.state !== 'idle') return

		if (resendFetcher.isOk) {
			toast.success('Nouveau code envoyé !')
			form.setValue('otp', '')
			setOtpError(false)
			restart()
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
		restart,
	])

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
						timeLeft={countdown.timeLeft}
						resendIn={countdown.resendIn}
						canResend={countdown.canResend}
						isSubmitting={resendFetcher.isSubmitting}
						formatTime={countdown.formatTime}
						onResend={handleResend}
						onEditPhone={onEditPhone}
					/>
				)}
			/>
		</form>
	)
}
