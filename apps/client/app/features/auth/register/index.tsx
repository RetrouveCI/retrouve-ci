import { useState, useEffect } from 'react'
import { Link, useFetcher, useNavigate } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useForm, useInputControl, getFormProps } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { useAuth } from '@/shared/auth/auth-context'
import { phoneNumberSchema, otpSchema, newPasswordSchema } from '../auth.schema'
import { sendPhoneOtp, verifyPhoneOtp } from '../lib/phone-auth.client'
import { PhoneStep } from '../components/phone-step'
import { OtpStep } from '../components/otp-step'
import { PasswordStep } from '../components/password-step'
import { registerAction } from './servers/register.action'

export const action = registerAction

type Step = 'phone' | 'otp' | 'create-password'

const OTP_EXPIRY_SECONDS = 120

export default function RegisterPage() {
	const navigate = useNavigate()
	const { isAuthenticated } = useAuth()
	const fetcher = useFetcher<{ ok: boolean; error?: string }>()

	const [step, setStep] = useState<Step>('phone')
	const [phoneNumber, setPhoneNumber] = useState('')
	const [otpError, setOtpError] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [timeLeft, setTimeLeft] = useState(OTP_EXPIRY_SECONDS)
	const [resendKey, setResendKey] = useState(0)

	useEffect(() => {
		if (isAuthenticated) navigate('/account')
	}, [isAuthenticated, navigate])

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

	const handlePhoneSubmit = async (value: string) => {
		setIsSubmitting(true)
		const ok = await sendPhoneOtp(value)

		setIsSubmitting(false)

		if (!ok) {
			toast.error('Impossible d’envoyer le code', {
				description: 'Vérifiez le numéro et réessayez.',
			})
			return
		}

		toast.success('Code envoyé !', {
			description: 'Vérifiez vos SMS ou WhatsApp.',
		})
		setPhoneNumber(value)
		otpControl.change('')
		setOtpError(false)
		setStep('otp')
	}

	const [phoneForm, phoneFields] = useForm({
		id: 'register-phone-form',
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

	const phoneControl = useInputControl(phoneFields.phoneNumber)

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
		setStep('create-password')
	}

	const [otpForm, otpFields] = useForm({
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
	const otpControl = useInputControl(otpFields.otp)

	const [passwordForm, passwordFields] = useForm({
		id: 'register-password-form',
		constraint: getZodConstraint(newPasswordSchema),
		shouldValidate: 'onSubmit',
		shouldRevalidate: 'onInput',
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: newPasswordSchema })
		},
	})
	const newPasswordControl = useInputControl(passwordFields.newPassword)
	const confirmPasswordControl = useInputControl(passwordFields.confirmPassword)

	useEffect(() => {
		if (fetcher.state !== 'idle' || !fetcher.data) return

		if (fetcher.data.ok) {
			toast.success('Compte créé !', {
				description: 'Bienvenue sur RetrouveCI.',
			})
			navigate('/account')
		} else {
			toast.error(
				fetcher.data.error ?? 'Une erreur est survenue. Veuillez réessayer.',
			)
		}
	}, [fetcher.state, fetcher.data, navigate])

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

	const goBack = () => {
		if (step === 'otp') setStep('phone')
		else if (step === 'create-password') setStep('otp')
	}

	const title =
		step === 'phone'
			? 'Créer un compte'
			: step === 'otp'
				? 'Vérification'
				: 'Sécurisez votre compte'

	const description =
		step === 'phone' ? (
			'Rejoignez la communauté RetrouveCI.'
		) : step === 'otp' ? (
			<>
				Code envoyé au{' '}
				<span className="text-foreground font-semibold">
					+225 {phoneNumber}
				</span>
			</>
		) : (
			'Choisissez un mot de passe sécurisé.'
		)

	return (
		<>
			<div className="mb-6">
				{step === 'phone' ? (
					<Link
						to="/"
						className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
					>
						<ArrowLeft className="h-4 w-4" />
						Retour
					</Link>
				) : (
					<button
						onClick={goBack}
						className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
					>
						<ArrowLeft className="h-4 w-4" />
						Retour
					</button>
				)}
			</div>

			<div className="mb-8">
				<h2 className="mb-2 text-2xl font-bold lg:text-3xl">{title}</h2>
				<p className="text-muted-foreground">{description}</p>
			</div>

			{step === 'phone' && (
				<>
					<form {...getFormProps(phoneForm)}>
						<PhoneStep
							phoneNumber={phoneControl.value ?? ''}
							setPhoneNumber={phoneControl.change}
							errors={phoneFields.phoneNumber.errors}
							isSubmitting={isSubmitting}
						/>
					</form>
					<p className="text-muted-foreground mt-6 text-center text-sm">
						Déjà un compte ?{' '}
						<Link
							to="/auth/login"
							className="text-primary-green font-semibold hover:underline"
						>
							Se connecter
						</Link>
					</p>
				</>
			)}

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

			{step === 'create-password' && (
				<fetcher.Form method="post" {...getFormProps(passwordForm)}>
					<input type="hidden" name="intent" value="set-initial-password" />
					<PasswordStep
						step="create-password"
						newPassword={newPasswordControl.value ?? ''}
						setNewPassword={newPasswordControl.change}
						confirmPassword={confirmPasswordControl.value ?? ''}
						setConfirmPassword={confirmPasswordControl.change}
						newPasswordErrors={passwordFields.newPassword.errors}
						confirmPasswordErrors={passwordFields.confirmPassword.errors}
						isSubmitting={fetcher.state !== 'idle'}
					/>
				</fetcher.Form>
			)}
		</>
	)
}
