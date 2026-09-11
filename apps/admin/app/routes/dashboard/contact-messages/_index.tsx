import { useState } from 'react'
import type { FieldValues } from 'react-hook-form'
import { useActionFetcher } from '@/shared/hooks/use-action-fetcher'
import { useSettledSubmission } from '@/shared/hooks/use-settled-submission'
import { Badge, Button } from '@app/ui/components'
import { CONTACT_MESSAGE_STATUSES } from '@app/contracts/contact-messages'
import { BentoCard } from '@/components/bento-card'
import { DataTable } from '@/components/data-table'
import { DensityToggle } from '@/components/density-toggle'
import { ListToolbar } from '@/components/list-toolbar'
import { STATUS_TONE_CLASSES } from '@/shared/constants/status-tone'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Eye, QrCode } from 'lucide-react'
import { toast } from 'sonner'
import type { ColumnDef } from '@tanstack/react-table'
import type {
	ContactMessage,
	ContactMessageStatus,
} from './types/contact-messages.types'
import { ContactMessageDetailDialog } from './components/contact-message-detail-dialog'
import { contactMessagesLoader } from './servers/contact-messages.loader'
import { contactMessagesAction } from './servers/contact-messages.action'
import type { RouteHandle } from '@/shared/helpers/page-meta'
import type { Route } from './+types/_index'

export const loader = contactMessagesLoader
export const action = contactMessagesAction

export const handle: RouteHandle = { title: 'Messages de contact' }

const STATUS_FILTER_LABELS: Record<ContactMessageStatus, string> = {
	new: 'Nouveaux',
	read: 'Lus',
	archived: 'Archivés',
}

const STATUS_BADGE: Record<
	ContactMessageStatus,
	{ label: string; className: string }
> = {
	new: { label: 'Nouveau', className: STATUS_TONE_CLASSES.info },
	read: { label: 'Lu', className: STATUS_TONE_CLASSES.neutral },
	archived: { label: 'Archivé', className: STATUS_TONE_CLASSES.neutral },
}

export default function ContactMessagesPage({
	loaderData,
}: Route.ComponentProps) {
	const { messages, total, page, pageSize, counts } = loaderData
	const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
		null,
	)
	const [detailOpen, setDetailOpen] = useState(false)

	const viewFetcher = useActionFetcher<
		typeof contactMessagesAction,
		FieldValues,
		ContactMessage
	>()
	const archiveFetcher = useActionFetcher<
		typeof contactMessagesAction,
		FieldValues,
		ContactMessage
	>()

	const isArchiving = archiveFetcher.state !== 'idle'

	useSettledSubmission(viewFetcher.response, result => {
		if (result.success && result.data) setSelectedMessage(result.data)
	})

	useSettledSubmission(archiveFetcher.response, result => {
		if (result.success) {
			toast.success('Message archivé')
			if (result.data) setSelectedMessage(result.data)
		} else {
			toast.error(
				result.errors?.root?.message ?? "Impossible d'archiver le message",
			)
		}
	})

	const handleView = (message: ContactMessage) => {
		setSelectedMessage(message)
		setDetailOpen(true)
		if (message.status === 'new') {
			viewFetcher.submit({ intent: 'view', id: message.id }, { method: 'post' })
		}
	}

	const handleArchive = (id: string) => {
		archiveFetcher.submit({ intent: 'archive', id }, { method: 'post' })
	}

	const columns: ColumnDef<ContactMessage>[] = [
		{
			accessorKey: 'createdAt',
			header: 'Date',
			cell: ({ row }) =>
				format(new Date(row.original.createdAt), 'dd MMM yyyy', { locale: fr }),
		},
		{
			accessorKey: 'name',
			header: 'Expéditeur',
			cell: ({ row }) => {
				const { name, email, phone } = row.original
				return (
					<div>
						<p className="text-sm font-medium">{name}</p>
						<p className="text-muted-foreground text-xs">
							{email ?? phone ?? '—'}
						</p>
					</div>
				)
			},
		},
		{
			accessorKey: 'subject',
			header: 'Sujet',
			cell: ({ row }) => (
				<div className="flex items-center gap-1.5">
					{row.original.qrTokenCode && (
						<QrCode className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
					)}
					<span className="text-sm">{row.original.subject}</span>
				</div>
			),
		},
		{
			accessorKey: 'status',
			header: 'Statut',
			cell: ({ row }) => {
				const cfg = STATUS_BADGE[row.original.status]
				return <Badge className={cfg.className}>{cfg.label}</Badge>
			},
		},
		{
			id: 'actions',
			header: 'Actions',
			cell: ({ row }) => (
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8"
					onClick={() => handleView(row.original)}
				>
					<Eye className="h-4 w-4" />
				</Button>
			),
		},
	]

	return (
		<>
			<div>
				<div className="space-y-4 p-4 lg:p-6">
					<BentoCard variant="table">
						<ListToolbar
							chips={[
								{ value: 'all', label: 'Tous', count: counts?.all },
								...CONTACT_MESSAGE_STATUSES.map(status => ({
									value: status,
									label: STATUS_FILTER_LABELS[status],
									count: counts?.[status],
								})),
							]}
							searchPlaceholder="Nom, e-mail, sujet…"
						>
							<DensityToggle />
						</ListToolbar>
						<div className="p-4">
							<DataTable
								columns={columns}
								data={messages}
								pagination={{ page, pageSize, total }}
							/>
						</div>
					</BentoCard>
				</div>
			</div>

			<ContactMessageDetailDialog
				message={selectedMessage}
				open={detailOpen}
				onOpenChange={setDetailOpen}
				onArchive={handleArchive}
				isArchiving={isArchiving}
			/>
		</>
	)
}
