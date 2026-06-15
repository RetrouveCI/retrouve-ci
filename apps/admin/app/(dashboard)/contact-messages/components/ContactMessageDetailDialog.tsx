import {
	Button,
	Badge,
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@retrouve-ci/ui/components'
import { Mail, Archive } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { ContactMessage } from '@/domain/entities/contact-message'

const statusConfig: Record<
	ContactMessage['status'],
	{ label: string; className: string }
> = {
	new: { label: 'Nouveau', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
	read: { label: 'Lu', className: 'bg-muted text-muted-foreground hover:bg-muted' },
	archived: {
		label: 'Archivé',
		className: 'bg-gray-100 text-gray-700 hover:bg-gray-100',
	},
}

interface ContactMessageDetailDialogProps {
	message: ContactMessage | null
	open: boolean
	onOpenChange: (v: boolean) => void
	onArchive: (id: string) => void
}

export function ContactMessageDetailDialog({
	message,
	open,
	onOpenChange,
	onArchive,
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
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium">{message.name}</p>
							<p className="text-muted-foreground text-sm">{message.email}</p>
						</div>
						<Badge className={cfg.className}>{cfg.label}</Badge>
					</div>
					<div className="bg-muted/30 rounded-xl border p-4 text-sm whitespace-pre-wrap">
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
						<Button onClick={() => onArchive(message.id)}>
							<Archive className="mr-2 h-4 w-4" /> Archiver
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
