import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Controller, useController, useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { OTP_LENGTH } from '@app/contracts/shared'
import { withRedirect } from '@/shared/helpers/redirect'
import { useActionFetcher } from '@/shared/hooks/use-action-fetcher'
import { toErrorList } from '../../helpers/field-errors'
import {
	resetPasswordFormSchema,
	type ResetPasswordFormData,
	type ResetPasswordFormInput,
} from '../reset-password.schema'
import { AuthSubmitButton } from '../../components/auth-submit-button'
import { OtpStep } from '../../components/otp-step'
import { PasswordStep } from '../../components/password-step'
import { useOtpCountdown } from '../../hooks/use-otp-countdown'
import { useSettledSubmission } from '../../hooks/use-settled-submission'
import type { ResetPasswordStep } from '../reset-password.types'
import type { action } from '../_index'

interface ResetPasswordFormProps {
	phoneNumber: string
	redirectTo: string
	step: ResetPasswordStep
	onStepChange: (step: ResetPasswordStep) => void
}

/**
 * Two screens, one form. The API has no way to check a reset code on its own —
 * `/phone-number/reset-password` takes the code and the new password in a single
 * call — so the code is only confirmed at the final submission. Keeping one
 * `useForm` mounted across both steps is what makes a refusal cheap: the visitor
 * is sent back to the code with the password they typed still in place.
 */
export function ResetPasswordForm({
	phoneNumber,
	redirectTo,
	step,
	onStepChange,
}: ResetPasswordFormProps) {
	const navigate = useNavigate()

	const [otpError, setOtpError] = useState(false)

	const countdown = useOtpCountdown()

	// Two fetchers, because the resend is a side mutation: its outcome is a toast
	// and must not be read as this form's answer. `useActionFetcher` falls back to
	// `useId()`, so the two stay apart without a key.
	const fetcher = useActionFetcher<typeof action, ResetPasswordFormInput>()
	const resendFetcher = useActionFetcher<typeof action>()

	const form = useForm<ResetPasswordFormInput, unknown, ResetPasswordFormData>({
		resolver: standardSchemaResolver(resetPasswordFormSchema),
		mode: 'onSubmit',
		reValidateMode: 'onChange',
		defaultValues: { otp: '', newPassword: '', confirmPassword: '' },
	})

	const newPassword = useController({
		control: form.control,
		name: 'newPassword',
	})
	const confirmPassword = useController({
		control: form.control,
		name: 'confirmPassword',
	})

	const { restart } = countdown

	const submitReset = form.handleSubmit(values => {
		void fetcher.submit(
			{
				intent: 'reset-password',
				phoneNumber,
				otp: values.otp,
				newPassword: values.newPassword,
			},
			{ method: 'post' },
		)
	})

	useSettledSubmission(fetcher.response, () => {
		if (fetcher.isOk) {
			toast.success('Mot de passe réinitialisé !', {
				description: 'Vous pouvez maintenant vous connecter.',
			})
			void navigate(withRedirect('/auth/login', redirectTo), { replace: true })
			return
		}

		// The password was held to the schema before this call, so the code is the
		// only thing left for the API to refuse. Back to the code step it goes,
		// marked — and the password stays typed in this very form.
		setOtpError(true)
		form.setValue('otp', '')
		onStepChange('otp')
	})

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

	const handleResend = () => {
		void resendFetcher.submit(
			{ intent: 'resend-otp', phoneNumber },
			{ method: 'post' },
		)
	}

	// The code field is hidden, not unmounted, so focus would otherwise stay on
	// an invisible element and the keyboard flow would stall.
	useEffect(() => {
		if (step === 'new-password') form.setFocus('newPassword')
	}, [step, form])

	// Enter on the code step must advance rather than post: submitting there
	// would fail on the password fields and show its errors on a hidden block.
	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		if (step === 'new-password') {
			void submitReset(event)
			return
		}

		event.preventDefault()
		if (form.getValues('otp').length === OTP_LENGTH) {
			onStepChange('new-password')
		}
	}

	const isBusy = fetcher.isSubmitting || resendFetcher.isSubmitting

	return (
		<form onSubmit={handleSubmit} noValidate className="space-y-7">
			<div className={step === 'otp' ? undefined : 'hidden'}>
				<Controller
					control={form.control}
					name="otp"
					render={({ field }) => (
						<OtpStep
							otp={field.value}
							setOtp={field.onChange}
							otpError={otpError}
							setOtpError={setOtpError}
							errorMessage="Code incorrect ou expiré. Vérifiez-le ou demandez-en un nouveau."
							// No server call to make here: the API only checks the code
							// together with the password, so six digits simply open the
							// next step.
							onComplete={() => onStepChange('new-password')}
							resendIn={countdown.resendIn}
							canResend={countdown.canResend}
							isSubmitting={isBusy}
							onResend={handleResend}
						/>
					)}
				/>
			</div>

			{/* Hidden rather than unmounted: unmounting is what used to lose the
			    password when a refused code sent the visitor back to the code. */}
			<div className={step === 'new-password' ? undefined : 'hidden'}>
				<PasswordStep
					newPassword={newPassword.field.value}
					setNewPassword={newPassword.field.onChange}
					confirmPassword={confirmPassword.field.value}
					setConfirmPassword={confirmPassword.field.onChange}
					newPasswordErrors={toErrorList(newPassword.fieldState.error)}
					confirmPasswordErrors={toErrorList(confirmPassword.fieldState.error)}
					isSubmitting={isBusy}
					autoFocus={false}
				/>
			</div>

			{/* The code step carries no button, as the mockup has it: the six digits
			    are what moves the flow on. */}
			{step === 'new-password' && (
				<AuthSubmitButton
					isSubmitting={isBusy}
					pendingLabel="Changement en cours..."
				>
					Changer mon mot de passe
				</AuthSubmitButton>
			)}
		</form>
	)
}
