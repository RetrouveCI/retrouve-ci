import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { OtpStepSection } from './components/otp-step-section'
import { NewPasswordStepSection } from './components/new-password-step-section'

type Step = 'otp' | 'new-password'

export default function ResetPasswordPage() {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()

	const phoneNumber = searchParams.get('phone') ?? ''

	const [step, setStep] = useState<Step>('otp')
	const [otp, setOtp] = useState('')
	const [otpError, setOtpError] = useState(false)

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
				<OtpStepSection
					phoneNumber={phoneNumber}
					initialError={otpError}
					onVerified={value => {
						setOtp(value)
						setStep('new-password')
					}}
				/>
			)}

			{step === 'new-password' && (
				<NewPasswordStepSection
					phoneNumber={phoneNumber}
					otp={otp}
					onSuccess={() => navigate('/auth/login')}
					onFail={() => {
						setOtpError(true)
						setStep('otp')
					}}
				/>
			)}
		</>
	)
}
