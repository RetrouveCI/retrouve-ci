import { Link } from 'react-router'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@retrouve-ci/ui/components'
import { ArrowLeft } from 'lucide-react'
import { ResetPasswordForm } from './components/reset-password-form'
import { resetPasswordAction } from './servers/reset-password.action'
import type { Route } from './+types/index'

export const action = resetPasswordAction

export function loader({ request }: Route.LoaderArgs) {
	const token = new URL(request.url).searchParams.get('token')
	return { token }
}

export default function ResetPasswordPage({
	loaderData,
}: Route.ComponentProps) {
	const { token } = loaderData

	if (!token) {
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
					<CardTitle className="text-2xl font-bold">Lien invalide</CardTitle>
					<CardDescription className="text-base">
						Ce lien de réinitialisation est invalide ou a expiré. Refaites une
						demande pour en recevoir un nouveau.
					</CardDescription>
				</CardHeader>
				<CardContent className="pb-8 text-center">
					<Link
						to="/auth/forgot-password"
						className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
					>
						<ArrowLeft className="h-4 w-4" />
						Demander un nouveau lien
					</Link>
				</CardContent>
			</Card>
		)
	}

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
					Nouveau mot de passe
				</CardTitle>
				<CardDescription className="text-base">
					Choisissez un mot de passe sécurisé pour votre compte.
				</CardDescription>
			</CardHeader>

			<CardContent className="pb-8 space-y-5">
				<ResetPasswordForm token={token} />

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
