import { Link } from 'react-router'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@retrouve-ci/ui/components'
import { ArrowLeft } from 'lucide-react'
import { ForgotPasswordForm } from './components/forgot-password-form'
import { forgotPasswordAction } from './servers/forgot-password.action'

export const action = forgotPasswordAction

export default function ForgotPasswordPage() {
	return (
		<Card className="w-full max-w-md border-0 shadow-2xl">
			<CardHeader className="pt-8 pb-8 text-center">
				<div className="mb-6 flex justify-center">
					<img
						src="/logo.png"
						alt="RetrouveCI"
						width={64}
						height={64}
						className="rounded-2xl shadow-lg"
					/>
				</div>
				<CardTitle className="text-2xl font-bold">
					Mot de passe oublié
				</CardTitle>
				<CardDescription className="text-base">
					Entrez votre email pour recevoir les instructions de
					réinitialisation.
				</CardDescription>
			</CardHeader>

			<CardContent className="pb-8 space-y-5">
				<ForgotPasswordForm />

				<div className="text-center">
					<Link
						to="/auth/login"
						className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
					>
						<ArrowLeft className="h-4 w-4" />
						Retour à la connexion
					</Link>
				</div>
			</CardContent>
		</Card>
	)
}
