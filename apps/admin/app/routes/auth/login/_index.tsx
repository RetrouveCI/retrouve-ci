import { AuthCard } from '../components/auth-card'
import { LoginForm } from './components/login-form'
import type { RouteHandle } from '@/shared/helpers/page-meta'

export const handle: RouteHandle = { title: 'Connexion' }

export default function LoginPage() {
	return (
		<AuthCard
			title="Connexion"
			description="Connectez-vous pour accéder au backoffice."
		>
			<LoginForm />
		</AuthCard>
	)
}
