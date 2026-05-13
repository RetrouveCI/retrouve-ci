'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/auth-context'
import { BrandingPanel } from './components/BrandingPanel'
import { PhoneStep } from './components/PhoneStep'
import { OtpStep } from './components/OtpStep'
import { PasswordStep } from './components/PasswordStep'

type Mode = 'login' | 'register' | 'forgot'
type Step = 'phone' | 'otp' | 'password' | 'create-password' | 'new-password'

const OTP_EXPIRY_SECONDS = 120

const MODE_CONFIG: Record<Mode, { title: string; description: string }> = {
	login: {
		title: 'Bon retour !',
		description: 'Connectez-vous pour accéder à votre compte.',
	},
	register: {
		title: 'Créer un compte',
		description: 'Rejoignez la communauté RetrouveCI.',
	},
	forgot: {
		title: 'Mot de passe oublié',
		description: 'Réinitialisez votre mot de passe.',
	},
}

export default function AuthPage() {
	const router = useRouter()
	const { login, register, resetPassword, isAuthenticated } = useAuth()

	const [mode, setMode] = useState<Mode>('login')
	const [step, setStep] = useState<Step>('phone')
	const [isSubmitting, setIsSubmitting] = useState(false)

	const [phoneNumber, setPhoneNumber] = useState('')
	const [otp, setOtp] = useState('')
	const [otpError, setOtpError] = useState(false)
	const [password, setPassword] = useState('')
	const [passwordError, setPasswordError] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [confirmError, setConfirmError] = useState('')

	const [timeLeft, setTimeLeft] = useState(OTP_EXPIRY_SECONDS)
	const [canResend, setCanResend] = useState(false)

	useEffect(() => {
		if (isAuthenticated) router.push('/account')
	}, [isAuthenticated, router])

	useEffect(() => {
		if (step !== 'otp') return
		setTimeLeft(OTP_EXPIRY_SECONDS)
		setCanResend(false)
		const interval = setInterval(() => {
			setTimeLeft(prev => {
				if (prev <= 1) {
					clearInterval(interval)
					setCanResend(true)
					return 0
				}
				return prev - 1
			})
		}, 1000)
		return () => clearInterval(interval)
	}, [step])

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
		await new Promise(r => setTimeout(r, 1000))
		setIsSubmitting(false)
		toast.success('Code envoyé !', { description: 'Vérifiez vos SMS ou WhatsApp.' })
		setOtp('')
		setOtpError(false)
		setStep('otp')
	}

	const handleOTPSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (otp.length < 6) {
			toast.error('Entrez le code complet à 6 chiffres')
			setOtpError(true)
			return
		}
		setIsSubmitting(true)
		await new Promise(r => setTimeout(r, 1000))
		if (otp.startsWith('9')) {
			setOtpError(true)
			toast.error('Code incorrect', { description: 'Vérifiez le code reçu et réessayez.' })
			setOtp('')
			setIsSubmitting(false)
			return
		}
		setIsSubmitting(false)
		if (mode === 'register') setStep('create-password')
		else setStep('new-password')
	}

	const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (password.length < 4) {
			setPasswordError('Mot de passe trop court.')
			return
		}
		setPasswordError('')
		setIsSubmitting(true)
		const result = await login(phoneNumber, password)
		if (!result.success) {
			setPasswordError(result.error ?? 'Mot de passe incorrect.')
			setIsSubmitting(false)
			return
		}
		router.push('/account')
	}

	const handleCreatePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
		await register(phoneNumber, newPassword)
		toast.success('Compte créé !', { description: 'Bienvenue sur RetrouveCI.' })
		router.push('/account')
	}

	const handleNewPasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
		await resetPassword(phoneNumber, newPassword)
		toast.success('Mot de passe réinitialisé !', {
			description: 'Vous pouvez maintenant vous connecter.',
		})
		switchMode('login')
	}

	const handleResend = async () => {
		if (!canResend) return
		setIsSubmitting(true)
		await new Promise(r => setTimeout(r, 800))
		toast.success('Nouveau code envoyé !')
		setOtp('')
		setOtpError(false)
		setIsSubmitting(false)
		setStep('phone')
		setTimeout(() => setStep('otp'), 0)
	}

	const switchMode = (m: Mode) => {
		setMode(m)
		setStep('phone')
		setPhoneNumber('')
		setOtp('')
		setOtpError(false)
		setPassword('')
		setPasswordError('')
		setNewPassword('')
		setConfirmPassword('')
		setConfirmError('')
	}

	const goBack = () => {
		if (step === 'otp') setStep('phone')
		else if (step === 'create-password' || step === 'new-password') setStep('otp')
	}

	const stepTitle = () => {
		if (step === 'phone') return MODE_CONFIG[mode].title
		if (step === 'otp') return 'Vérification'
		if (step === 'create-password') return 'Sécurisez votre compte'
		return 'Nouveau mot de passe'
	}

	const stepDescription = () => {
		if (step === 'phone') return MODE_CONFIG[mode].description
		if (step === 'otp')
			return (
				<>
					Code envoyé au{' '}
					<span className="text-foreground font-semibold">+225 {phoneNumber}</span>
				</>
			)
		if (step === 'create-password') return 'Choisissez un mot de passe sécurisé.'
		return 'Choisissez un nouveau mot de passe.'
	}

	return (
		<div className="flex min-h-screen">
			<BrandingPanel />

			<div className="bg-background flex min-h-screen flex-1 flex-col">
				<header className="flex items-center justify-between border-b p-4 lg:hidden">
					<Link href="/" className="flex items-center gap-2">
						<Image
							src="/logo.png"
							alt="RetrouveCI"
							width={32}
							height={32}
							className="rounded-lg"
						/>
						<span className="text-lg font-bold">
							Retrouve<span className="text-accent-orange">CI</span>
						</span>
					</Link>
				</header>

				<div className="flex flex-1 items-center justify-center p-6 lg:p-12">
					<div className="w-full max-w-md">
						<div className="mb-6">
							{step === 'phone' ? (
								<Link
									href="/"
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
							<h2 className="mb-2 text-2xl font-bold lg:text-3xl">{stepTitle()}</h2>
							<p className="text-muted-foreground">{stepDescription()}</p>
						</div>

						{step === 'phone' && (
							<PhoneStep
								mode={mode}
								phoneNumber={phoneNumber}
								setPhoneNumber={setPhoneNumber}
								password={password}
								setPassword={setPassword}
								passwordError={passwordError}
								setPasswordError={setPasswordError}
								isSubmitting={isSubmitting}
								onSubmit={mode === 'login' ? handleLoginSubmit : handlePhoneSubmit}
								onSwitchMode={switchMode}
							/>
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
								onSubmit={handleOTPSubmit}
								onResend={handleResend}
							/>
						)}

						{(step === 'create-password' || step === 'new-password') && (
							<PasswordStep
								step={step}
								newPassword={newPassword}
								setNewPassword={setNewPassword}
								confirmPassword={confirmPassword}
								setConfirmPassword={setConfirmPassword}
								confirmError={confirmError}
								setConfirmError={setConfirmError}
								isSubmitting={isSubmitting}
								onSubmit={
									step === 'create-password'
										? handleCreatePasswordSubmit
										: handleNewPasswordSubmit
								}
							/>
						)}

						<div className="mt-8 border-t pt-6">
							<p className="text-muted-foreground text-center text-xs">
								En continuant, vous acceptez nos{' '}
								<Link href="/terms" className="text-primary-green hover:underline">
									conditions d&apos;utilisation
								</Link>{' '}
								et notre{' '}
								<Link href="/privacy" className="text-primary-green hover:underline">
									politique de confidentialite
								</Link>
								.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
