import { Link } from 'react-router'
import { AlertCircle, Lock, ShieldCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { qrContactLoader } from './servers/qr-contact.loader'
import { qrContactAction } from './servers/qr-contact.action'
import { QrOwnerCard } from './components/qr-owner-card'
import { QrContactForm } from './components/qr-contact-form'
import { pageMeta } from '@/shared/helpers/page-meta'
import type { QrTokenPublicView } from './servers/qr-contact.service'
import type { Route } from './+types/_index'

export const loader = ({ params }: Route.LoaderArgs) =>
	qrContactLoader({ params })

export const action = ({ request, params }: Route.ActionArgs) =>
	qrContactAction({ request, params })

export function meta() {
	return pageMeta({
		title: 'Objet perdu',
		description:
			'Vous avez trouvé cet objet ? Contactez son propriétaire via RetrouveCI.',
	})
}

/** The one statement of the screen, so the note below only ever explains it. */
function headline({ status, ownerFirstName }: QrTokenPublicView) {
	if (status === 'revoked') return 'Sticker désactivé'
	if (status === 'generated') return 'Sticker non activé'

	return ownerFirstName
		? `Merci ! Cet objet appartient à ${ownerFirstName}`
		: "Merci ! Cet objet appartient à quelqu'un"
}

interface StatusNoteProps {
	icon: LucideIcon
	children: string
}

function StatusNote({ icon: Icon, children }: StatusNoteProps) {
	return (
		<div className="border-border bg-card flex items-start gap-3 rounded-[14px] border p-5">
			<Icon className="text-muted-foreground mt-0.5 h-5 w-5 shrink-0" />
			<p className="text-muted-foreground text-sm">{children}</p>
		</div>
	)
}

export default function QrContactPage({ loaderData }: Route.ComponentProps) {
	const { token } = loaderData

	return (
		<div className="bg-background safe-x flex min-h-screen flex-col">
			<header
				className="flex items-center justify-center py-6"
				style={{ paddingTop: 'calc(1.5rem + var(--safe-top))' }}
			>
				<Link to="/" className="flex min-h-11 items-center gap-2 px-3">
					<img src="/logo.png" alt="RetrouveCI" className="h-8 w-8" />
					<span className="font-bold">RetrouveCI</span>
				</Link>
			</header>

			<main className="flex flex-1 items-start justify-center px-4 py-6">
				<div className="w-full max-w-md space-y-5">
					<div className="space-y-2 text-center">
						<h1 className="text-2xl leading-tight font-bold text-balance">
							{headline(token)}
						</h1>
						{token.status === 'activated' && (
							<p className="text-muted-foreground mx-auto max-w-xs text-sm">
								Prévenez-le en un geste. Vous n&apos;avez pas besoin de compte.
							</p>
						)}
					</div>

					<QrOwnerCard token={token} />

					{token.status === 'activated' ? (
						<>
							<div className="border-border bg-card rounded-[14px] border p-5">
								<QrContactForm />
							</div>
							<p className="text-muted-foreground flex items-center justify-center gap-1.5 text-center text-xs">
								<ShieldCheck className="h-3.5 w-3.5 shrink-0" />
								Le numéro du propriétaire ne vous est jamais montré.
							</p>
						</>
					) : token.status === 'revoked' ? (
						<StatusNote icon={Lock}>
							Le propriétaire a désactivé ce sticker. Il n&apos;est plus
							possible de le contacter via ce lien.
						</StatusNote>
					) : (
						<StatusNote icon={AlertCircle}>
							Ce sticker n&apos;a pas encore été activé par son propriétaire.
						</StatusNote>
					)}
				</div>
			</main>

			<footer
				className="py-6 text-center"
				style={{ paddingBottom: 'max(1.5rem, var(--safe-bottom))' }}
			>
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
