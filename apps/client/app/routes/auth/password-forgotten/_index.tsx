import { Link, useSearchParams } from 'react-router'
import { redirectIfAuthenticated } from '@/shared/helpers/session.server'
import { sanitizeRedirect, withRedirect } from '@/shared/helpers/redirect'
import { AuthPageHeader } from '../components/auth-page-header'
import { PhoneForm } from './components/phone-form'
import { passwordForgottenAction } from './servers/password-forgotten.action'
import type { Route } from './+types/_index'
import { pageMeta } from '@/shared/helpers/page-meta'

export function meta() {
	return pageMeta({
		title: 'Mot de passe oublié',
		description: 'Réinitialisez le mot de passe de votre compte RetrouveCI.',
	})
}

export const action = passwordForgottenAction

export async function loader({ request }: Route.LoaderArgs) {
	await redirectIfAuthenticated(request)
	return null
}

export default function PasswordForgottenPage() {
	const [searchParams] = useSearchParams()

	// Both come back when the reset screen sends someone here to correct their
	// number: the number so it need not be retyped, the destination so the flow
	// still ends where it started.
	const phoneNumber = searchParams.get('phone') ?? ''
	const redirectTo = sanitizeRedirect(searchParams.get('redirectTo'))
	const loginUrl = withRedirect('/auth/login', redirectTo)

	return (
		<>
			<AuthPageHeader
				flow="Mot de passe oublié"
				heading="On vous renvoie un code"
				description="Entrez le numéro de votre compte. Un code de vérification vous sera envoyé par SMS."
				backTo={loginUrl}
			/>

			<PhoneForm defaultPhoneNumber={phoneNumber} redirectTo={redirectTo} />

			<p className="text-muted-foreground mt-6 text-center text-xs">
				Vous vous souvenez ?{' '}
				<Link
					to={loginUrl}
					className="text-primary-green font-semibold hover:underline"
				>
					Se connecter
				</Link>
			</p>
		</>
	)
}
