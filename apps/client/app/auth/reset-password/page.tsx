'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/auth-context'
import { OtpStep } from '../components/OtpStep'
import { PasswordStep } from '../components/PasswordStep'

type Step = 'otp' | 'new-password'

const OTP_EXPIRY_SECONDS = 120

function ResetPasswordContent() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const { resetPassword } = useAuth()

	const phoneNumber = searchParams.get('phone') ?? ''

	const [step, setStep] = useState<Step>('otp')
	const [otp, setOtp] = useState('')
	const [otpError, setOtpError] = useState(false)
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [confirmError, setConfirmError] = useState('')
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

	const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
		setStep('new-password')
	}

	const handleNewPasswordSubmit = async (
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
		await resetPassword(phoneNumber, newPassword)
		toast.success('Mot de passe réinitialisé !', {
			description: 'Vous pouvez maintenant vous connecter.',
		})
		router.push('/auth/login')
	}

	const handleResend = async () => {
		setIsSubmitting(true)
		await new Promise(r => setTimeout(r, 800))
		toast.success('Nouveau code envoyé !')
		setOtp('')
		setOtpError(false)
		setIsSubmitting(false)
		setResendKey(k => k + 1)
	}

	const goBack = () => {
		if (step === 'otp') router.push('/auth/password-forgotten')
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

			{step === 'new-password' && (
				<PasswordStep
					step="new-password"
					newPassword={newPassword}
					setNewPassword={setNewPassword}
					confirmPassword={confirmPassword}
					setConfirmPassword={setConfirmPassword}
					confirmError={confirmError}
					setConfirmError={setConfirmError}
					isSubmitting={isSubmitting}
					onSubmit={handleNewPasswordSubmit}
				/>
			)}
		</>
	)
}

export default function ResetPasswordPage() {
	return (
		<Suspense>
			<ResetPasswordContent />
		</Suspense>
	)
}
