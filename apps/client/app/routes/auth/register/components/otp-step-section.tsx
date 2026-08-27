import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Controller, useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { useActionFetcher } from '@/shared/hooks/use-action-fetcher'
import { otpSchema, type OtpData, type OtpInput } from '../register.schema'
import { verifyPhoneOtp } from '../../helpers/phone-auth.client'
import { OtpStep } from '../../components/otp-step'
import { useOtpCountdown } from '../../hooks/use-otp-countdown'
import type { action } from '../_index'

interface OtpStepSectionProps {
	phoneNumber: string
	onVerified: () => void
	onEditPhone: () => void
}

export function OtpStepSection({
	phoneNumber,
	onVerified,
	onEditPhone,
}: OtpStepSectionProps) {
	const [otpError, setOtpError] = useState(false)
	const [isVerifying, setIsVerifying] = useState(false)
	const [hasRequestedResend, setHasRequestedResend] = useState(false)

	const countdown = useOtpCountdown()

	const form = useForm<OtpInput, unknown, OtpData>({
		resolver: standardSchemaResolver(otpSchema),
		mode: 'onSubmit',
		reValidateMode: 'onChange',
		defaultValues: { otp: '' },
	})

	// The resend is a side mutation, not this form's submission: its outcome is
	// reported with a toast rather than through the form's own errors.
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
						timeLeft={countdown.timeLeft}
						resendIn={countdown.resendIn}
						canResend={countdown.canResend}
						isSubmitting={isVerifying || resendFetcher.isSubmitting}
						formatTime={countdown.formatTime}
						onResend={handleResend}
						onEditPhone={onEditPhone}
					/>
				)}
			/>
		</form>
	)
}
