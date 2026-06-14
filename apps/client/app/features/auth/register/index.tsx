import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/shared/auth/auth-context'
import { authClient } from '@/shared/auth/auth-client'
import { apiFetch } from '@/shared/lib/api-client'
import { toE164 } from '@/shared/auth/phone'
import { PhoneStep } from '../components/phone-step'
import { OtpStep } from '../components/otp-step'
import { PasswordStep } from '../components/password-step'

type Step = 'phone' | 'otp' | 'create-password'

const OTP_EXPIRY_SECONDS = 120

export default function RegisterPage() {
	const navigate = useNavigate()
	const { isAuthenticated } = useAuth()

	const [step, setStep] = useState<Step>('phone')
	const [phoneNumber, setPhoneNumber] = useState('')
	const [otp, setOtp] = useState('')
	const [otpError, setOtpError] = useState(false)
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [confirmError, setConfirmError] = useState('')
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

	const handlePhoneSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const cleaned = phoneNumber.replace(/\s/g, '')
		if (!cleaned || cleaned.length < 8) {
			toast.error('Veuillez entrer un numéro valide')
			return
		}
		setIsSubmitting(true)
		const result = await authClient.phoneNumber.sendOtp({
			phoneNumber: toE164(phoneNumber),
		})
		setIsSubmitting(false)
		if (result.error) {
			toast.error('Impossible d’envoyer le code', {
				description: 'Vérifiez le numéro et réessayez.',
			})
			return
		}
		toast.success('Code envoyé !', {
			description: 'Vérifiez vos SMS ou WhatsApp.',
		})
		setOtp('')
		setOtpError(false)
		setStep('otp')
	}

	const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (otp.length < 6) {
			toast.error('Entrez le code complet à 6 chiffres')
			setOtpError(true)
			return
		}
		setIsSubmitting(true)
		const result = await authClient.phoneNumber.verify({
			phoneNumber: toE164(phoneNumber),
			code: otp,
		})
		setIsSubmitting(false)
		if (result.error) {
			setOtpError(true)
			toast.error('Code incorrect', {
				description: 'Vérifiez le code reçu et réessayez.',
			})
			setOtp('')
			return
		}
		setStep('create-password')
	}

	const handleCreatePasswordSubmit = async (
		e: React.FormEvent<HTMLFormElement>,
	) => {
		e.preventDefault()
		if (newPassword.length < 6) {
			setConfirmError('Le mot de passe doit contenir au moins 6 caractères.')
			return
		}
		if (newPassword !== confirmPassword) {
			setConfirmError('Les mots de passe ne correspondent pas.')
			return
		}
		setConfirmError('')
		setIsSubmitting(true)
		await apiFetch('/account/set-initial-password', {
			method: 'POST',
			body: JSON.stringify({ newPassword }),
		})
		setIsSubmitting(false)
		toast.success('Compte créé !', { description: 'Bienvenue sur RetrouveCI.' })
		navigate('/account')
	}

	const handleResend = async () => {
		setIsSubmitting(true)
		const result = await authClient.phoneNumber.sendOtp({
			phoneNumber: toE164(phoneNumber),
		})
		setIsSubmitting(false)
		if (result.error) {
			toast.error('Impossible d’envoyer le code')
			return
		}
		toast.success('Nouveau code envoyé !')
		setOtp('')
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
					<PhoneStep
						phoneNumber={phoneNumber}
						setPhoneNumber={setPhoneNumber}
						isSubmitting={isSubmitting}
						onSubmit={handlePhoneSubmit}
					/>
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
				<OtpStep
					otp={otp}
					setOtp={setOtp}
					otpError={otpError}
					setOtpError={setOtpError}
					timeLeft={timeLeft}
					isSubmitting={isSubmitting}
					formatTime={formatTime}
					onSubmit={handleOtpSubmit}
					onResend={handleResend}
				/>
			)}

			{step === 'create-password' && (
				<PasswordStep
					step="create-password"
					newPassword={newPassword}
					setNewPassword={setNewPassword}
					confirmPassword={confirmPassword}
					setConfirmPassword={setConfirmPassword}
					confirmError={confirmError}
					setConfirmError={setConfirmError}
					isSubmitting={isSubmitting}
					onSubmit={handleCreatePasswordSubmit}
				/>
			)}
		</>
	)
}
