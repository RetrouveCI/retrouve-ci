import { Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { redirectIfAuthenticated } from '@/shared/auth/auth.server'
import { PhoneForm } from './components/phone-form'
import { passwordForgottenAction } from './servers/password-forgotten.action'
import type { Route } from './+types/index'

export const action = passwordForgottenAction

export async function loader({ request }: Route.LoaderArgs) {
	await redirectIfAuthenticated(request)
	return null
}

export default function PasswordForgottenPage() {
	return (
		<>
			<div className="mb-6">
				<Link
					to="/auth/login"
					className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
				>
					<ArrowLeft className="h-4 w-4" />
					Retour
				</Link>
			</div>

			<div className="mb-8">
				<h2 className="mb-2 text-2xl font-bold lg:text-3xl">
					Mot de passe oublié
				</h2>
				<p className="text-muted-foreground">
					Réinitialisez votre mot de passe.
				</p>
			</div>

			<PhoneForm />

			<p className="text-muted-foreground mt-6 text-center text-sm">
				Retour à{' '}
				<Link
					to="/auth/login"
					className="text-primary-green font-semibold hover:underline"
				>
					la connexion
				</Link>
			</p>
		</>
	)
}
