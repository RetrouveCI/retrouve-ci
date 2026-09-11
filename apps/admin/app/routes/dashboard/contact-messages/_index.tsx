import { Link } from 'react-router'
import { toast } from 'sonner'
import type { FieldValues } from 'react-hook-form'
import { Badge, Button } from '@app/ui/components'
import { CONTACT_MESSAGE_STATUSES } from '@app/contracts/contact-messages'
import { BentoCard } from '@/components/bento-card'
import { BatchBar } from '@/components/batch-bar'
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
import { contactMessagesAction } from './servers/contact-messages.action'
import {
	batchMessage,
	batchSucceeded,
	isBatchOutcome,
} from '@/shared/helpers/batch-report'
import { usePageSelection } from '@/shared/hooks/use-page-selection'
import { useActionFetcher } from '@/shared/hooks/use-action-fetcher'
import { useSettledSubmission } from '@/shared/hooks/use-settled-submission'
import type { BatchOutcome } from '@app/contracts/shared'
import type { RouteHandle } from '@/shared/helpers/page-meta'
import type { Route } from './+types/_index'

// Reading and archiving one message happen on its own page; the list keeps
// the action for what a selection archives at once.
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
	const [selected, setSelected] = usePageSelection()

	const batchFetcher = useActionFetcher<
		typeof contactMessagesAction,
		FieldValues,
		BatchOutcome
	>()

	useSettledSubmission(batchFetcher.response, result => {
		if (!result.success) {
			toast.error(
				result.errors?.root?.message ?? 'Impossible d’archiver la sélection',
			)
			return
		}

		const outcome = result.data
		if (!isBatchOutcome(outcome)) return

		const message = batchMessage(outcome, {
			one: 'message archivé',
			many: 'messages archivés',
		})

		if (batchSucceeded(outcome)) toast.success(message)
		else toast.error(message)

		// What stays ticked is what did not go through.
		setSelected(outcome.failed.map(item => item.id))
	})

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
				<BatchBar
					selected={selected}
					onClear={() => setSelected([])}
					action="Archiver la sélection"
					confirmTitle={`Archiver ${selected.length} message${selected.length > 1 ? 's' : ''} ?`}
					confirmBody="Ils quittent la file de traitement. Rien n’est envoyé à leurs expéditeurs, et ils restent consultables par le filtre « Archivés »."
					submitting={batchFetcher.isSubmitting}
					onConfirm={() =>
						batchFetcher.submit(
							{ intent: 'archive-batch', ids: selected },
							{ method: 'post' },
						)
					}
				/>
				<div className="p-4">
					<DataTable
						columns={columns}
						data={messages}
						pagination={{ page, pageSize, total }}
						selection={{
							selected,
							onChange: setSelected,
							idOf: message => message.id,
							label: message => `Sélectionner « ${message.subject} »`,
						}}
					/>
				</div>
			</BentoCard>
		</div>
	)
}
