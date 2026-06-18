import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router'
import { AuthCard } from '../components/auth-card'
import { ForgotPasswordForm } from './components/forgot-password-form'
import { forgotPasswordAction } from './servers/forgot-password.action'

export const action = forgotPasswordAction

function BackToLogin() {
	return (
		<Link
			to="/auth/login"
			className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
		>
			<ArrowLeft className="h-4 w-4" />
			Retour à la connexion
		</Link>
	)
}

export default function ForgotPasswordPage() {
	return (
		<AuthCard
			title="Mot de passe oublié"
			description="Entrez votre email pour recevoir les instructions de réinitialisation."
			footer={<BackToLogin />}
		>
			<ForgotPasswordForm />
		</AuthCard>
	)
}
