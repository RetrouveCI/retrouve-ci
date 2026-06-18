import { useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '@/shared/auth/auth-context'
import { redirectIfAuthenticated } from '@/shared/auth/auth.server'
import { sanitizeRedirect } from '@/shared/auth/redirect'
import { LoginForm } from './components/login-form'
import type { Route } from './+types/index'

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
			<div className="mb-6">
				<Link
					to="/"
					className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
				>
					<ArrowLeft className="h-4 w-4" />
					Retour à l&apos;accueil
				</Link>
			</div>

			<div className="mb-8">
				<h2 className="mb-2 text-2xl font-bold lg:text-3xl">Bon retour !</h2>
				<p className="text-muted-foreground">
					Connectez-vous pour accéder à votre compte.
				</p>
			</div>

			<LoginForm redirectTo={redirectTo} />
		</>
	)
}
