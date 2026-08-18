import { redirect } from 'react-router'
import { getServerSession } from '@/shared/helpers/session.server'
import { AuthCard } from '../components/auth-card'
import { LoginForm } from './components/login-form'
import type { RouteHandle } from '@/shared/helpers/page-meta'

export const handle: RouteHandle = { title: 'Connexion' }
export async function loader({ request }: { request: Request }) {
	const session = await getServerSession(request)
	if (session?.user?.role === 'admin') throw redirect('/')
	return null
}

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
