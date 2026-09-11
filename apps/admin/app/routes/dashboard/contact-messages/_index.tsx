import { Link } from 'react-router'
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
import type { ColumnDef } from '@tanstack/react-table'
import type {
	ContactMessage,
	ContactMessageStatus,
} from './types/contact-messages.types'
import { contactMessagesLoader } from './servers/contact-messages.loader'
import type { RouteHandle } from '@/shared/helpers/page-meta'
import type { Route } from './+types/_index'

// Reading and archiving happen on the message's own page now.
export const loader = contactMessagesLoader

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
				<Link
					to={`/contact-messages/${row.original.id}`}
					className="flex items-center gap-1.5 hover:underline"
				>
					{row.original.qrTokenCode && (
						<QrCode className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
					)}
					<span className="text-sm">{row.original.subject}</span>
				</Link>
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
				<Button variant="ghost" size="icon" className="h-8 w-8" asChild>
					<Link
						to={`/contact-messages/${row.original.id}`}
						aria-label="Ouvrir le message"
					>
						<Eye className="h-4 w-4" />
					</Link>
				</Button>
			),
		},
	]

	return (
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
	)
}
