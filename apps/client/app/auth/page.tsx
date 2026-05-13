'use client'

import { Button, Input, Label, InputOTP, InputOTPGroup } from '@retrouve-ci/ui/components'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
	ArrowLeft,
	Loader2,
	CheckCircle2,
	RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@retrouve-ci/ui/utils'
import { BrandingPanel } from './components/BrandingPanel'
import { OtpSlots } from './components/OtpSlots'
import { PasswordInput } from './components/PasswordInput'

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

		toast.success('Code envoyé !', {
			description: 'Vérifiez vos SMS ou WhatsApp.',
		})
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
			toast.error('Code incorrect', {
				description: 'Vérifiez le code reçu et réessayez.',
			})
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
		toast.success('Compte créé !', {
			description: 'Bienvenue sur RetrouveCI.',
		})
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
		else if (step === 'create-password' || step === 'new-password')
			setStep('otp')
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
					<span className="text-foreground font-semibold">
						+225 {phoneNumber}
					</span>
				</>
			)
		if (step === 'create-password')
			return 'Choisissez un mot de passe sécurisé.'
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
							<h2 className="mb-2 text-2xl font-bold lg:text-3xl">
								{stepTitle()}
							</h2>
							<p className="text-muted-foreground">{stepDescription()}</p>
						</div>

						{step === 'phone' && (
							<form
								onSubmit={
									mode === 'login' ? handleLoginSubmit : handlePhoneSubmit
								}
								className="space-y-5"
							>
								<div className="space-y-2">
									<Label htmlFor="phone" className="text-sm font-medium">
										Numéro de téléphone
									</Label>
									<div className="flex gap-2">
										<div className="bg-muted/50 text-muted-foreground flex h-12 shrink-0 items-center rounded-xl border-2 px-4 text-sm font-medium">
											<Image
												src="/logo.png"
												alt=""
												width={18}
												height={18}
												className="mr-2 rounded-sm"
											/>
											+225
										</div>
										<Input
											id="phone"
											type="tel"
											placeholder="07 XX XX XX XX"
											value={phoneNumber}
											onChange={e => setPhoneNumber(e.target.value)}
											className="border-border bg-background focus:border-primary-green focus:ring-primary-green/20 h-12 flex-1 rounded-xl border-2 transition-all focus:ring-2"
											autoComplete="tel"
											autoFocus
										/>
									</div>
									<p className="text-muted-foreground text-xs">
										{mode === 'login'
											? 'Entrez le numéro associé à votre compte.'
											: 'Un code de vérification vous sera envoyé.'}
									</p>
								</div>

								{mode === 'login' && (
									<>
										<PasswordInput
											id="password"
											label="Mot de passe"
											value={password}
											onChange={v => {
												setPassword(v)
												setPasswordError('')
											}}
											placeholder="••••••••"
											disabled={isSubmitting}
										/>
										{passwordError && (
											<p className="text-destructive -mt-3 text-xs">
												{passwordError}
											</p>
										)}
										<div className="-mt-2 flex justify-end">
											<button
												type="button"
												onClick={() => switchMode('forgot')}
												className="text-muted-foreground hover:text-foreground text-xs transition-colors"
											>
												Mot de passe oublié ?
											</button>
										</div>
									</>
								)}

								<Button
									type="submit"
									className="bg-primary-green hover:bg-primary-green-dark h-12 w-full rounded-xl text-base font-semibold text-white transition-all hover:scale-[1.02]"
									disabled={isSubmitting}
								>
									{isSubmitting ? (
										<>
											<Loader2 className="h-4 w-4 animate-spin" />{' '}
											{mode === 'login' ? 'Connexion...' : 'Envoi en cours...'}
										</>
									) : mode === 'login' ? (
										'Se connecter'
									) : (
										'Continuer'
									)}
								</Button>

								<div className="space-y-3 pt-2 text-center text-sm">
									{mode === 'login' && (
										<p className="text-muted-foreground">
											Pas encore de compte ?{' '}
											<button
												type="button"
												onClick={() => switchMode('register')}
												className="text-primary-green font-semibold hover:underline"
											>
												Créer un compte
											</button>
										</p>
									)}
									{mode === 'register' && (
										<p className="text-muted-foreground">
											Déjà un compte ?{' '}
											<button
												type="button"
												onClick={() => switchMode('login')}
												className="text-primary-green font-semibold hover:underline"
											>
												Se connecter
											</button>
										</p>
									)}
									{mode === 'forgot' && (
										<p className="text-muted-foreground">
											Retour à{' '}
											<button
												type="button"
												onClick={() => switchMode('login')}
												className="text-primary-green font-semibold hover:underline"
											>
												la connexion
											</button>
										</p>
									)}
								</div>
							</form>
						)}

						{step === 'otp' && (
							<form onSubmit={handleOTPSubmit} className="space-y-6">
								<div className="space-y-4">
									<div className="flex justify-center">
										<InputOTP
											maxLength={6}
											value={otp}
											onChange={val => {
												setOtp(val)
												setOtpError(false)
											}}
											disabled={isSubmitting}
											containerClassName="gap-2"
										>
											<InputOTPGroup className="gap-2">
												<OtpSlots error={otpError} />
											</InputOTPGroup>
										</InputOTP>
									</div>
									{otpError && (
										<p className="text-destructive text-center text-sm">
											Code incorrect. Verifiez et reessayez.
										</p>
									)}
								</div>

								<div className="flex justify-center">
									{timeLeft > 0 ? (
										<div
											className={cn(
												'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium',
												timeLeft <= 30
													? 'text-destructive bg-destructive/10'
													: 'bg-primary-green/10 text-primary-green',
											)}
										>
											<span className="text-base tabular-nums">
												{formatTime(timeLeft)}
											</span>
											<span className="text-muted-foreground text-xs font-normal">
												avant expiration
											</span>
										</div>
									) : (
										<button
											type="button"
											onClick={handleResend}
											disabled={isSubmitting}
											className="text-primary-green hover:text-primary-green-dark inline-flex items-center gap-2 text-sm font-semibold transition-colors disabled:opacity-50"
										>
											<RefreshCw
												className={cn(
													'h-4 w-4',
													isSubmitting && 'animate-spin',
												)}
											/>
											Renvoyer le code
										</button>
									)}
								</div>

								<Button
									type="submit"
									className="bg-primary-green hover:bg-primary-green-dark h-12 w-full rounded-xl text-base font-semibold text-white transition-all hover:scale-[1.02]"
									disabled={isSubmitting || otp.length < 6 || timeLeft === 0}
								>
									{isSubmitting ? (
										<>
											<Loader2 className="h-4 w-4 animate-spin" />{' '}
											Verification...
										</>
									) : (
										<>
											<CheckCircle2 className="h-4 w-4" /> Confirmer
										</>
									)}
								</Button>
							</form>
						)}

						{step === 'create-password' && (
							<form onSubmit={handleCreatePasswordSubmit} className="space-y-6">
								<PasswordInput
									id="new-password"
									label="Choisir un mot de passe"
									value={newPassword}
									onChange={v => {
										setNewPassword(v)
										setConfirmError('')
									}}
									placeholder="Minimum 6 caracteres"
									hint="Au moins 6 caracteres."
									disabled={isSubmitting}
									autoFocus
								/>
								<PasswordInput
									id="confirm-password"
									label="Confirmer le mot de passe"
									value={confirmPassword}
									onChange={v => {
										setConfirmPassword(v)
										setConfirmError('')
									}}
									disabled={isSubmitting}
								/>
								{confirmError && (
									<p className="text-destructive text-sm">{confirmError}</p>
								)}

								<Button
									type="submit"
									className="bg-primary-green hover:bg-primary-green-dark h-12 w-full rounded-xl text-base font-semibold text-white transition-all hover:scale-[1.02]"
									disabled={isSubmitting || newPassword.length < 6}
								>
									{isSubmitting ? (
										<>
											<Loader2 className="h-4 w-4 animate-spin" /> Creation du
											compte...
										</>
									) : (
										'Creer mon compte'
									)}
								</Button>
							</form>
						)}

						{step === 'new-password' && (
							<form onSubmit={handleNewPasswordSubmit} className="space-y-6">
								<PasswordInput
									id="new-password"
									label="Nouveau mot de passe"
									value={newPassword}
									onChange={v => {
										setNewPassword(v)
										setConfirmError('')
									}}
									placeholder="Minimum 6 caracteres"
									hint="Au moins 6 caracteres."
									disabled={isSubmitting}
									autoFocus
								/>
								<PasswordInput
									id="confirm-password"
									label="Confirmer le nouveau mot de passe"
									value={confirmPassword}
									onChange={v => {
										setConfirmPassword(v)
										setConfirmError('')
									}}
									disabled={isSubmitting}
								/>
								{confirmError && (
									<p className="text-destructive text-sm">{confirmError}</p>
								)}

								<Button
									type="submit"
									className="bg-primary-green hover:bg-primary-green-dark h-12 w-full rounded-xl text-base font-semibold text-white transition-all hover:scale-[1.02]"
									disabled={isSubmitting || newPassword.length < 6}
								>
									{isSubmitting ? (
										<>
											<Loader2 className="h-4 w-4 animate-spin" />{' '}
											Reinitialisation...
										</>
									) : (
										'Reinitialiser le mot de passe'
									)}
								</Button>
							</form>
						)}

						<div className="mt-8 border-t pt-6">
							<p className="text-muted-foreground text-center text-xs">
								En continuant, vous acceptez nos{' '}
								<Link
									href="/terms"
									className="text-primary-green hover:underline"
								>
									conditions d&apos;utilisation
								</Link>{' '}
								et notre{' '}
								<Link
									href="/privacy"
									className="text-primary-green hover:underline"
								>
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
