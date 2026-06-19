import { useEffect, useState } from 'react'
import { useSearchParams, useFetcher } from 'react-router'
import { Badge, Button } from '@retrouve-ci/ui/components'
import { BentoCard } from '@/shared/components/bento-card'
import { DataTable } from '@/shared/components/data-table'
import { STATUS_TONE_CLASSES } from '@/shared/lib/status-tone'
import { cn } from '@retrouve-ci/ui/utils'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Eye, QrCode } from 'lucide-react'
import { toast } from 'sonner'
import type { ColumnDef } from '@tanstack/react-table'
import type {
	ContactMessage,
	ContactMessageStatus,
} from './contact-messages.types'
import { ContactMessageDetailDialog } from './components/contact-message-detail-dialog'
import { contactMessagesLoader } from './servers/contact-messages.loader'
import { contactMessagesAction } from './servers/contact-messages.action'
import type { RouteHandle } from '@/shared/lib/page-meta'
import type { Route } from './+types/index'

export const loader = contactMessagesLoader
export const action = contactMessagesAction

export const handle: RouteHandle = { title: 'Messages de contact' }

const STATUS_FILTERS = ['all', 'new', 'read', 'archived'] as const
type StatusFilter = (typeof STATUS_FILTERS)[number]

const STATUS_LABELS: Record<StatusFilter, string> = {
	all: 'Tous',
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

interface ActionResult {
	ok: boolean
	message?: ContactMessage
	error?: string
}

export default function ContactMessagesPage({
	loaderData,
}: Route.ComponentProps) {
	const { messages, statusFilter } = loaderData
	const [searchParams, setSearchParams] = useSearchParams()
	const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
		null,
	)
	const [detailOpen, setDetailOpen] = useState(false)

	const viewFetcher = useFetcher<ActionResult>()
	const archiveFetcher = useFetcher<ActionResult>()

	const isArchiving = archiveFetcher.state !== 'idle'

	useEffect(() => {
		if (viewFetcher.state !== 'idle' || !viewFetcher.data) return
		if (viewFetcher.data.ok && viewFetcher.data.message) {
			setSelectedMessage(viewFetcher.data.message)
		}
	}, [viewFetcher.state, viewFetcher.data])

	useEffect(() => {
		if (archiveFetcher.state !== 'idle' || !archiveFetcher.data) return
		if (archiveFetcher.data.ok) {
			toast.success('Message archivé')
			if (archiveFetcher.data.message) {
				setSelectedMessage(archiveFetcher.data.message)
			}
		} else {
			toast.error(
				archiveFetcher.data.error ?? "Impossible d'archiver le message",
			)
		}
	}, [archiveFetcher.state, archiveFetcher.data])

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

	const handleFilterChange = (filter: StatusFilter) => {
		const next = new URLSearchParams(searchParams)
		if (filter === 'all') {
			next.delete('status')
		} else {
			next.set('status', filter)
		}
		setSearchParams(next)
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
						<div className="border-b px-5 py-4">
							<div className="bg-muted/60 inline-flex flex-wrap items-center gap-0.5 rounded-lg p-0.5">
								{STATUS_FILTERS.map(val => (
									<button
										key={val}
										onClick={() => handleFilterChange(val)}
										className={cn(
											'rounded-md px-3 py-1 text-xs font-medium transition-colors',
											statusFilter === val
												? 'bg-card text-foreground shadow-sm'
												: 'text-muted-foreground hover:text-foreground',
										)}
									>
										{STATUS_LABELS[val]}
									</button>
								))}
							</div>
						</div>
						<div className="p-4">
							<DataTable
								columns={columns}
								data={messages}
								searchKey="subject"
								searchPlaceholder="Rechercher par sujet..."
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
