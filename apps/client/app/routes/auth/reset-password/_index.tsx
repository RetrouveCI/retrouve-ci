import { useCallback, useState } from 'react'
import {
	useNavigate,
	useSearchParams,
	type ShouldRevalidateFunction,
} from 'react-router'
import { redirectIfAuthenticated } from '@/shared/helpers/session.server'
import { sanitizeRedirect } from '@/shared/helpers/redirect'
import { recoveryUrl } from '../helpers/recovery-url'
import { AuthPageHeader } from '../components/auth-page-header'
import { ResetPasswordForm } from './components/reset-password-form'
import type { ResetPasswordStep } from './reset-password.types'
import { resetPasswordAction } from './servers/reset-password.action'
import type { Route } from './+types/_index'
import { pageMeta } from '@/shared/helpers/page-meta'

export function meta() {
	return pageMeta({
		title: 'Nouveau mot de passe',
		description:
			'Choisissez un nouveau mot de passe pour votre compte RetrouveCI.',
	})
}

export const action = resetPasswordAction

export async function loader({ request }: Route.LoaderArgs) {
	await redirectIfAuthenticated(request)
	return null
}

/** The loader carries no data; revalidating it only re-runs the guard above. */
export const shouldRevalidate: ShouldRevalidateFunction = () => false

export default function ResetPasswordPage() {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()

	const phoneNumber = searchParams.get('phone') ?? ''
	const redirectTo = sanitizeRedirect(searchParams.get('redirectTo'))

	const [step, setStep] = useState<ResetPasswordStep>('otp')

	const backToPhone = useCallback(
		() =>
			void navigate(
				recoveryUrl('/auth/password-forgotten', phoneNumber, redirectTo),
			),
		[navigate, phoneNumber, redirectTo],
	)

	const goBack = () => {
		if (step === 'otp') backToPhone()
		else setStep('otp')
	}

	return (
		<>
			<AuthPageHeader
				flow="Mot de passe oublié"
				heading={
					step === 'otp' ? 'Le code reçu par SMS' : 'Votre nouveau mot de passe'
				}
				description={
					step === 'otp' ? (
						<>
							Envoyé au{' '}
							<b className="text-foreground font-semibold">
								+225 {phoneNumber}
							</b>
							.
							<br />
							<button
								type="button"
								onClick={backToPhone}
								className="text-primary-green font-semibold underline-offset-4 hover:underline"
							>
								Ce n’est pas le bon numéro ?
							</button>
						</>
					) : (
						'Il remplacera celui que vous avez oublié.'
					)
				}
				step={step === 'otp' ? 1 : 2}
				totalSteps={2}
				onBack={goBack}
			/>

			<ResetPasswordForm
				phoneNumber={phoneNumber}
				redirectTo={redirectTo}
				step={step}
				onStepChange={setStep}
			/>
		</>
	)
}
