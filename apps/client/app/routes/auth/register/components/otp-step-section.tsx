import { useState } from 'react'
import { toast } from 'sonner'
import { Controller, useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { useActionFetcher } from '@/shared/hooks/use-action-fetcher'
import { otpSchema, type OtpData, type OtpInput } from '../register.schema'
import { verifyPhoneOtp } from '../../helpers/phone-auth.client'
import { OtpStep } from '../../components/otp-step'
import { useOtpCountdown } from '../../hooks/use-otp-countdown'
import { useSettledSubmission } from '../../hooks/use-settled-submission'
import type { action } from '../_index'

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

	useSettledSubmission(resendFetcher.response, () => {
		if (!resendFetcher.isOk) {
			toast.error('Impossible d’envoyer le code', {
				description: resendFetcher.errors?.root?.message,
			})
			return
		}

		toast.success('Nouveau code envoyé !')
		form.setValue('otp', '')
		setOtpError(false)
		restart()
	})

	const onSubmit = async (values: OtpData) => {
		setIsVerifying(true)
		const ok = await verifyPhoneOtp(phoneNumber, values.otp)
		setIsVerifying(false)
		if (!ok) {
			setOtpError(true)
			form.setValue('otp', '')
			return
		}
		onVerified()
	}

	const handleResend = () => {
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
						// The mockup gives this step no button: the six digits are the
						// submission, so the code leaves as soon as it is complete. The
						// value is passed straight through — reading it back off the form
						// would race the change that just produced it.
						onComplete={otp => void onSubmit({ otp })}
						resendIn={countdown.resendIn}
						canResend={countdown.canResend}
						isSubmitting={isVerifying || resendFetcher.isSubmitting}
						onResend={handleResend}
					/>
				)}
			/>
		</form>
	)
}
