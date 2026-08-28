import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { useAuth } from '@/context/auth'
import { redirectIfAuthenticated } from '@/shared/helpers/session.server'
import { sanitizeRedirect } from '@/shared/helpers/redirect'
import { AuthPageHeader } from '../components/auth-page-header'
import { LoginForm } from './components/login-form'
import type { Route } from './+types/_index'
import { pageMeta } from '@/shared/helpers/page-meta'

export function meta() {
	return pageMeta({
		title: 'Connexion',
		description: 'Connectez-vous à votre compte RetrouveCI.',
	})
}

export async function loader({ request }: Route.LoaderArgs) {
	await redirectIfAuthenticated(request)
	return null
}

export default function LoginPage() {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const { isAuthenticated } = useAuth()

	const redirectTo = sanitizeRedirect(searchParams.get('redirectTo'))

	useEffect(() => {
		if (isAuthenticated) navigate(redirectTo, { replace: true })
	}, [isAuthenticated, navigate, redirectTo])

	return (
		<>
			<AuthPageHeader
				flow="Connexion"
				heading="Bon retour"
				description="Connectez-vous avec le numéro utilisé à l’inscription."
				backTo="/"
			/>

			<LoginForm redirectTo={redirectTo} />
		</>
	)
}
