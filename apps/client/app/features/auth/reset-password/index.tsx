import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useForm, useInputControl, getFormProps } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { otpSchema, newPasswordSchema } from '../auth.schema'
import {
	requestPhonePasswordReset,
	resetPhonePassword,
} from '../lib/phone-auth.client'
import { OtpStep } from '../components/otp-step'
import { PasswordStep } from '../components/password-step'

type Step = 'otp' | 'new-password'

const OTP_EXPIRY_SECONDS = 120

export default function ResetPasswordPage() {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()

	const phoneNumber = searchParams.get('phone') ?? ''

	const [step, setStep] = useState<Step>('otp')
	const [otp, setOtp] = useState('')
	const [otpError, setOtpError] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [timeLeft, setTimeLeft] = useState(OTP_EXPIRY_SECONDS)
	const [resendKey, setResendKey] = useState(0)

	useEffect(() => {
		if (step !== 'otp') return
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
	}, [step, resendKey])

	const formatTime = (s: number) =>
		`${Math.floor(s / 60)
			.toString()
			.padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

	const handleOtpSubmit = (value: string) => {
		setOtp(value)
		setStep('new-password')
	}

	const [otpForm, otpFields] = useForm({
		id: 'reset-password-otp-form',
		constraint: getZodConstraint(otpSchema),
		shouldValidate: 'onSubmit',
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: otpSchema })
		},
		onSubmit(event, { submission }) {
			event.preventDefault()
			if (submission?.status !== 'success') return
			handleOtpSubmit(submission.value.otp)
		},
	})
	const otpControl = useInputControl(otpFields.otp)

	const handleNewPasswordSubmit = async (value: {
		newPassword: string
		confirmPassword: string
	}) => {
		setIsSubmitting(true)
		const ok = await resetPhonePassword({
			phoneNumber,
			otp,
			newPassword: value.newPassword,
		})
		setIsSubmitting(false)
		if (!ok) {
			toast.error('Code incorrect ou expiré', {
				description: 'Veuillez resaisir le code reçu par SMS.',
			})
			otpControl.change('')
			setOtpError(true)
			setStep('otp')
			return
		}
		toast.success('Mot de passe réinitialisé !', {
			description: 'Vous pouvez maintenant vous connecter.',
		})
		navigate('/auth/login')
	}

	const [passwordForm, passwordFields] = useForm({
		id: 'reset-password-new-password-form',
		constraint: getZodConstraint(newPasswordSchema),
		shouldValidate: 'onSubmit',
		shouldRevalidate: 'onInput',
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: newPasswordSchema })
		},
		onSubmit(event, { submission }) {
			event.preventDefault()
			if (submission?.status !== 'success') return
			void handleNewPasswordSubmit(submission.value)
		},
	})
	const newPasswordControl = useInputControl(passwordFields.newPassword)
	const confirmPasswordControl = useInputControl(
		passwordFields.confirmPassword,
	)

	const handleResend = async () => {
		setIsSubmitting(true)
		await requestPhonePasswordReset(phoneNumber)
		setIsSubmitting(false)
		toast.success('Nouveau code envoyé !')
		otpControl.change('')
		setOtpError(false)
		setResendKey(k => k + 1)
	}

	const goBack = () => {
		if (step === 'otp') navigate('/auth/password-forgotten')
		else setStep('otp')
	}

	const title = step === 'otp' ? 'Vérification' : 'Nouveau mot de passe'
	const description =
		step === 'otp' ? (
			<>
				Code envoyé au{' '}
				<span className="text-foreground font-semibold">
					+225 {phoneNumber}
				</span>
			</>
		) : (
			'Choisissez un nouveau mot de passe.'
		)

	return (
		<>
			<div className="mb-6">
				<button
					onClick={goBack}
					className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
				>
					<ArrowLeft className="h-4 w-4" />
					Retour
				</button>
			</div>

			<div className="mb-8">
				<h2 className="mb-2 text-2xl font-bold lg:text-3xl">{title}</h2>
				<p className="text-muted-foreground">{description}</p>
			</div>

			{step === 'otp' && (
				<form {...getFormProps(otpForm)}>
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
			)}

			{step === 'new-password' && (
				<form {...getFormProps(passwordForm)}>
					<PasswordStep
						step="new-password"
						newPassword={newPasswordControl.value ?? ''}
						setNewPassword={newPasswordControl.change}
						confirmPassword={confirmPasswordControl.value ?? ''}
						setConfirmPassword={confirmPasswordControl.change}
						newPasswordErrors={passwordFields.newPassword.errors}
						confirmPasswordErrors={passwordFields.confirmPassword.errors}
						isSubmitting={isSubmitting}
					/>
				</form>
			)}
		</>
	)
}
