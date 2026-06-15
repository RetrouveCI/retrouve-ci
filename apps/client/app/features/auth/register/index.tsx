import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '@/shared/auth/auth-context'
import { PhoneStepSection } from './components/phone-step-section'
import { OtpStepSection } from './components/otp-step-section'
import { CreatePasswordStepSection } from './components/create-password-step-section'
import { registerAction } from './servers/register.action'

export const action = registerAction

type Step = 'phone' | 'otp' | 'create-password'

export default function RegisterPage() {
	const navigate = useNavigate()
	const { isAuthenticated } = useAuth()

	const [step, setStep] = useState<Step>('phone')
	const [phoneNumber, setPhoneNumber] = useState('')

	useEffect(() => {
		if (isAuthenticated) navigate('/account')
	}, [isAuthenticated, navigate])

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
				<PhoneStepSection
					onVerified={value => {
						setPhoneNumber(value)
						setStep('otp')
					}}
				/>
			)}

			{step === 'otp' && (
				<OtpStepSection
					phoneNumber={phoneNumber}
					onVerified={() => setStep('create-password')}
				/>
			)}

			{step === 'create-password' && <CreatePasswordStepSection />}
		</>
	)
}
