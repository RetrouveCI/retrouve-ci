import { useState, useEffect } from 'react'
import {
	useNavigate,
	useSearchParams,
	type ShouldRevalidateFunction,
} from 'react-router'
import { useAuth } from '@/context/auth'
import { redirectIfAuthenticated } from '@/shared/helpers/session.server'
import { sanitizeRedirect } from '@/shared/helpers/redirect'
import { AuthPageHeader } from '../components/auth-page-header'
import { PhoneStepSection } from './components/phone-step-section'
import { OtpStepSection } from './components/otp-step-section'
import { CreatePasswordStepSection } from './components/create-password-step-section'
import { registerAction } from './servers/register.action'
import type { Route } from './+types/_index'
import { pageMeta } from '@/shared/helpers/page-meta'

export function meta() {
	return pageMeta({
		title: 'Créer un compte',
		description: 'Rejoignez RetrouveCI pour publier et retrouver des objets.',
	})
}

export const action = registerAction

export async function loader({ request }: Route.LoaderArgs) {
	await redirectIfAuthenticated(request)
	return null
}

/** The loader carries no data; revalidating it re-ran the guard above mid-flow. */
export const shouldRevalidate: ShouldRevalidateFunction = () => false

type Step = 'phone' | 'otp' | 'create-password'

const STEP_NUMBER: Record<Step, number> = {
	phone: 1,
	otp: 2,
	'create-password': 3,
}

export default function RegisterPage() {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const { isAuthenticated } = useAuth()

	const redirectTo = sanitizeRedirect(searchParams.get('redirectTo'))

	const [step, setStep] = useState<Step>('phone')
	const [phoneNumber, setPhoneNumber] = useState('')

	// Only on the first step. Verifying the code signs the visitor in — that is
	// how `set-initial-password` is authorised — so bouncing on `isAuthenticated`
	// past it stranded the new account on `/account` with no password ever set.
	useEffect(() => {
		if (step === 'phone' && isAuthenticated) {
			navigate(redirectTo, { replace: true })
		}
	}, [step, isAuthenticated, navigate, redirectTo])

	const goBack = () => {
		if (step === 'otp') setStep('phone')
		else if (step === 'create-password') setStep('otp')
	}

	const heading =
		step === 'phone'
			? 'Votre numéro'
			: step === 'otp'
				? 'Le code reçu par SMS'
				: 'Votre mot de passe'

	const description =
		step === 'phone' ? (
			'Il sert à vous connecter, et à vous joindre quand quelqu’un retrouve votre objet.'
		) : step === 'otp' ? (
			<>
				Envoyé au{' '}
				<b className="text-foreground font-semibold">+225 {phoneNumber}</b>.
				<br />
				<button
					type="button"
					onClick={() => setStep('phone')}
					className="text-primary-green-text font-semibold underline-offset-4 hover:underline"
				>
					Ce n’est pas le bon numéro ?
				</button>
			</>
		) : (
			'Il vous servira à vous reconnecter sans attendre de SMS.'
		)

	return (
		<>
			<AuthPageHeader
				flow="Créer un compte"
				heading={heading}
				description={description}
				step={STEP_NUMBER[step]}
				totalSteps={3}
				{...(step === 'phone' ? { backTo: '/' } : { onBack: goBack })}
			/>

			{step === 'phone' && (
				<PhoneStepSection
					defaultPhoneNumber={phoneNumber}
					redirectTo={redirectTo}
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

			{step === 'create-password' && (
				<CreatePasswordStepSection redirectTo={redirectTo} />
			)}
		</>
	)
}
