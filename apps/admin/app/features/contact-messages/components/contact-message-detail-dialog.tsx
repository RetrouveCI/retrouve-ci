import {
	Button,
	Badge,
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@retrouve-ci/ui/components'
import { Mail, Phone, Archive, QrCode } from 'lucide-react'
import { Link } from 'react-router'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type {
	ContactMessage,
	ContactMessageStatus,
} from '../contact-messages.types'

const statusConfig: Record<
	ContactMessageStatus,
	{ label: string; className: string }
> = {
	new: {
		label: 'Nouveau',
		className: 'bg-blue-50 text-blue-700 hover:bg-blue-50',
	},
	read: {
		label: 'Lu',
		className: 'bg-muted text-muted-foreground hover:bg-muted',
	},
	archived: {
		label: 'Archivé',
		className: 'bg-gray-50 text-gray-700 hover:bg-gray-50',
	},
}

interface ContactMessageDetailDialogProps {
	message: ContactMessage | null
	open: boolean
	onOpenChange: (open: boolean) => void
	onArchive: (id: string) => void
	isArchiving?: boolean
}

export function ContactMessageDetailDialog({
	message,
	open,
	onOpenChange,
	onArchive,
	isArchiving = false,
}: ContactMessageDetailDialogProps) {
	if (!message) return null
	const cfg = statusConfig[message.status]

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Mail className="text-primary h-5 w-5" />
						{message.subject}
					</DialogTitle>
				</DialogHeader>
				<div className="space-y-4">
					<div className="flex items-start justify-between gap-4">
						<div className="space-y-0.5">
							<p className="text-sm font-medium">{message.name}</p>
							{message.email && (
								<p className="text-muted-foreground flex items-center gap-1 text-sm">
									<Mail className="h-3.5 w-3.5" />
									{message.email}
								</p>
							)}
							{message.phone && (
								<p className="text-muted-foreground flex items-center gap-1 text-sm">
									<Phone className="h-3.5 w-3.5" />
									{message.phone}
								</p>
							)}
						</div>
						<Badge className={cfg.className}>{cfg.label}</Badge>
					</div>

					{message.qrTokenCode && (
						<div className="flex items-center gap-2 rounded-lg border border-dashed bg-gray-50 px-4 py-3">
							<QrCode className="text-muted-foreground h-4 w-4 shrink-0" />
							<span className="text-muted-foreground text-sm">
								Via sticker QR —{' '}
								<Link
									to={`/qr/${message.qrTokenCode}`}
									className="text-foreground font-medium hover:underline"
									onClick={() => onOpenChange(false)}
								>
									{message.qrTokenCode}
								</Link>
							</span>
						</div>
					)}

					<div className="bg-muted/30 rounded-lg border p-4 text-sm whitespace-pre-wrap">
						{message.message}
					</div>
					<div className="text-muted-foreground flex justify-between text-sm">
						<span>Reçu le</span>
						<span>
							{format(new Date(message.createdAt), "dd MMM yyyy 'à' HH:mm", {
								locale: fr,
							})}
						</span>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Fermer
					</Button>
					{message.status !== 'archived' && (
						<Button
							onClick={() => onArchive(message.id)}
							disabled={isArchiving}
						>
							<Archive className="mr-2 h-4 w-4" />
							{isArchiving ? 'Archivage...' : 'Archiver'}
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
