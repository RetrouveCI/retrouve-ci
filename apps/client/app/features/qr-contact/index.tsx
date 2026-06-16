import { Link } from 'react-router'
import { AlertCircle, Lock } from 'lucide-react'
import { qrContactLoader } from './servers/qr-contact.loader'
import { qrContactAction } from './servers/qr-contact.action'
import { QrOwnerCard } from './components/qr-owner-card'
import { QrContactForm } from './components/qr-contact-form'
import type { Route } from './+types/index'

export const loader = qrContactLoader
export const action = qrContactAction

export function meta() {
	return [
		{ title: 'Objet perdu — RetrouveCI' },
		{
			name: 'description',
			content:
				'Vous avez trouvé cet objet ? Contactez son propriétaire via RetrouveCI.',
		},
	]
}

export default function QrContactPage({ loaderData }: Route.ComponentProps) {
	const { token } = loaderData

	return (
		<div className="flex min-h-screen flex-col bg-gray-50">
			<header className="flex items-center justify-center py-6">
				<Link to="/" className="flex items-center gap-2">
					<img src="/logo.png" alt="RetrouveCI" className="h-8 w-8" />
					<span className="font-bold">RetrouveCI</span>
				</Link>
			</header>

			<main className="flex flex-1 items-start justify-center px-4 py-8">
				<div className="w-full max-w-md space-y-6">
					<div className="text-center">
						<p className="text-muted-foreground text-sm">
							Vous avez trouvé un objet avec ce sticker
						</p>
						<h1 className="mt-1 text-2xl font-bold">
							Contacter le propriétaire
						</h1>
					</div>

					<QrOwnerCard token={token} />

					{token.status === 'activated' ? (
						<div className="rounded-2xl border bg-white p-6 shadow-sm">
							<h2 className="mb-4 font-semibold">Envoyer un message</h2>
							<QrContactForm />
						</div>
					) : token.status === 'revoked' ? (
						<div className="flex items-start gap-3 rounded-2xl border bg-white p-6 shadow-sm">
							<Lock className="text-muted-foreground mt-0.5 h-5 w-5 shrink-0" />
							<div>
								<p className="font-medium">Sticker désactivé</p>
								<p className="text-muted-foreground mt-1 text-sm">
									Le propriétaire a désactivé ce sticker. Il n&apos;est plus
									possible de le contacter via ce lien.
								</p>
							</div>
						</div>
					) : (
						<div className="flex items-start gap-3 rounded-2xl border bg-white p-6 shadow-sm">
							<AlertCircle className="text-muted-foreground mt-0.5 h-5 w-5 shrink-0" />
							<div>
								<p className="font-medium">Sticker non activé</p>
								<p className="text-muted-foreground mt-1 text-sm">
									Ce sticker n&apos;a pas encore été activé par son
									propriétaire.
								</p>
							</div>
						</div>
					)}
				</div>
			</main>

			<footer className="py-6 text-center">
				<p className="text-muted-foreground text-xs">
					Propulsé par{' '}
					<Link to="/" className="hover:text-foreground underline">
						RetrouveCI
					</Link>{' '}
					— La plateforme d&apos;objets perdus en Côte d&apos;Ivoire
				</p>
			</footer>
		</div>
	)
}
