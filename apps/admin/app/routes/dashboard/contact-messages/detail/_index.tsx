import { Link } from 'react-router'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { AlertTriangle } from 'lucide-react'
import { Badge, Button } from '@app/ui/components'
import { STATUS_TONE_CLASSES } from '@/shared/constants/status-tone'
import type { RouteHandle } from '@/shared/helpers/page-meta'
import { contactMessagesAction } from '../servers/contact-messages.action'
import type { ContactMessageStatus } from '../types/contact-messages.types'
import { MessageActionsCard } from './components/message-actions-card'
import { MessageCard } from './components/message-card'
import { contactMessageLoader } from './servers/contact-message.loader'
import type { Route } from './+types/_index'

export const loader = contactMessageLoader
// The list's action, which reads the message's id from the form.
export const action = contactMessagesAction

export const handle: RouteHandle = {
	title: data =>
		(data as Route.ComponentProps['loaderData'] | undefined)?.message
			?.subject ?? 'Message',
	breadcrumb: [{ label: 'Messages de contact', to: '/contact-messages' }],
}

const STATUS_BADGE: Record<
	ContactMessageStatus,
	{ label: string; className: string }
> = {
	new: { label: 'Nouveau', className: STATUS_TONE_CLASSES.info },
	read: { label: 'Lu', className: STATUS_TONE_CLASSES.neutral },
	archived: { label: 'Archivé', className: STATUS_TONE_CLASSES.neutral },
}

export default function ContactMessagePage({
	loaderData,
}: Route.ComponentProps) {
	const { message } = loaderData
	const status = STATUS_BADGE[message.status]

	return (
		<div className="space-y-4 p-4 lg:p-6">
			<div className="flex flex-wrap items-center gap-2 text-sm">
				<Badge className={status.className}>{status.label}</Badge>
				<span className="text-muted-foreground">
					Reçu le{' '}
					{format(new Date(message.createdAt), "d MMM yyyy 'à' HH:mm", {
						locale: fr,
					})}
				</span>
			</div>

			<div className="grid gap-4 lg:grid-cols-3">
				<div className="lg:col-span-2">
					<MessageCard message={message} />
				</div>
				<div className="space-y-4">
					<MessageActionsCard message={message} />
				</div>
			</div>
		</div>
	)
}

export function ErrorBoundary() {
	return (
		<div className="flex flex-col items-center justify-center p-12 text-center">
			<AlertTriangle className="text-muted-foreground h-12 w-12" />
			<h2 className="mt-4 text-xl font-semibold">Message introuvable</h2>
			<p className="text-muted-foreground mt-2">
				Ce message n’existe pas, ou l’API ne répond pas.
			</p>
			<Button asChild className="mt-4">
				<Link to="/contact-messages">Retour aux messages</Link>
			</Button>
		</div>
	)
}
