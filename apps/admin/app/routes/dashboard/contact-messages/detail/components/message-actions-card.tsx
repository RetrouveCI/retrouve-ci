import type { FieldValues } from 'react-hook-form'
import { toast } from 'sonner'
import { Archive, Mail, MessageCircle } from 'lucide-react'
import {
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@app/ui/components'
import { toWhatsAppUrl } from '@app/contracts/shared'
import { useActionFetcher } from '@/shared/hooks/use-action-fetcher'
import { useSettledSubmission } from '@/shared/hooks/use-settled-submission'
import type { contactMessagesAction } from '../../servers/contact-messages.action'
import type { ContactMessage } from '../../types/contact-messages.types'

/** Replies leave by WhatsApp or e-mail, not from here — the artefact's rule. */
export function MessageActionsCard({ message }: { message: ContactMessage }) {
	const fetcher = useActionFetcher<
		typeof contactMessagesAction,
		FieldValues,
		ContactMessage
	>()

	useSettledSubmission(fetcher.response, result => {
		if (result.success) {
			toast.success('Message archivé')
			return
		}

		toast.error(
			result.errors?.root?.message ?? "Impossible d'archiver le message",
		)
	})

	const whatsApp = message.phone ? toWhatsAppUrl(message.phone) : null

	return (
		<Card>
			<CardHeader>
				<CardTitle>Répondre</CardTitle>
			</CardHeader>
			<CardContent className="space-y-2">
				{whatsApp && (
					<Button className="w-full justify-start" asChild>
						<a href={whatsApp} target="_blank" rel="noreferrer">
							<MessageCircle className="mr-2 h-4 w-4" />
							Répondre sur WhatsApp
						</a>
					</Button>
				)}
				{message.email && (
					<Button variant="outline" className="w-full justify-start" asChild>
						<a
							href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`}
						>
							<Mail className="mr-2 h-4 w-4" />
							Répondre par e-mail
						</a>
					</Button>
				)}
				{!whatsApp && !message.email && (
					<p className="text-muted-foreground text-sm">
						Ce message ne laisse ni numéro joignable ni e-mail.
					</p>
				)}
				{message.status !== 'archived' && (
					<Button
						variant="outline"
						className="w-full justify-start"
						disabled={fetcher.isSubmitting}
						onClick={() =>
							fetcher.submit(
								{ intent: 'archive', id: message.id },
								{ method: 'post' },
							)
						}
					>
						<Archive className="mr-2 h-4 w-4" />
						{fetcher.isSubmitting ? 'Archivage…' : 'Archiver'}
					</Button>
				)}
			</CardContent>
		</Card>
	)
}
