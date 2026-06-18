import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router'
import { AuthCard } from '../components/auth-card'
import { ResetPasswordForm } from './components/reset-password-form'
import { resetPasswordAction } from './servers/reset-password.action'
import type { Route } from './+types/index'

export const action = resetPasswordAction

export function loader({ request }: Route.LoaderArgs) {
	const token = new URL(request.url).searchParams.get('token')
	return { token }
}

function AuthBackLink({ to, children }: { to: string; children: string }) {
	return (
		<Link
			to={to}
			className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
		>
			<ArrowLeft className="h-4 w-4" />
			{children}
		</Link>
	)
}

export default function ResetPasswordPage({
	loaderData,
}: Route.ComponentProps) {
	const { token } = loaderData

	if (!token) {
		return (
			<AuthCard
				title="Lien invalide"
				description="Ce lien de réinitialisation est invalide ou a expiré. Refaites une demande pour en recevoir un nouveau."
				footer={
					<AuthBackLink to="/auth/forgot-password">
						Demander un nouveau lien
					</AuthBackLink>
				}
			/>
		)
	}

	return (
		<AuthCard
			title="Nouveau mot de passe"
			description="Choisissez un mot de passe sécurisé pour votre compte."
			footer={
				<AuthBackLink to="/auth/login">Retour à la connexion</AuthBackLink>
			}
		>
			<ResetPasswordForm token={token} />
		</AuthCard>
	)
}
