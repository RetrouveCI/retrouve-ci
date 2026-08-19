import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import {
	Button,
	Badge,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@app/ui/components'
import { BentoCard } from '@/components/bento-card'
import { DataTable } from '@/components/data-table'
import { STATUS_TONE_CLASSES } from '@/shared/constants/status-tone'
import { EventsStatsGrid } from './components/events-stats-grid'
import { EventFormDialog } from './components/event-form-dialog'
import { useActionFetcher } from '@/shared/hooks/use-action-fetcher'
import { eventsLoader } from './servers/events.loader'
import { eventsAction } from './servers/events.action'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import {
	MoreHorizontal,
	Plus,
	Pencil,
	Trash2,
	CheckCircle2,
	FileEdit,
	XCircle,
	MapPin,
} from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type { Event, EventStatus } from './types/events.types'
import type { RouteHandle } from '@/shared/helpers/page-meta'
import type { Route } from './+types/_index'

export const loader = eventsLoader
export const action = eventsAction

export const handle: RouteHandle = { title: 'Événements' }

const STATUS_CONFIG: Record<
	EventStatus,
	{ label: string; className: string; icon: React.ElementType }
> = {
	draft: {
		label: 'Brouillon',
		className: STATUS_TONE_CLASSES.warning,
		icon: FileEdit,
	},
	published: {
		label: 'Publié',
		className: STATUS_TONE_CLASSES.success,
		icon: CheckCircle2,
	},
	cancelled: {
		label: 'Annulé',
		className: STATUS_TONE_CLASSES.danger,
		icon: XCircle,
	},
}

export default function EventsPage({ loaderData }: Route.ComponentProps) {
	const { events, total, statusFilter } = loaderData
	const [searchParams, setSearchParams] = useSearchParams()

	const [formOpen, setFormOpen] = useState(false)
	const [editingEvent, setEditingEvent] = useState<Event | null>(null)
	const [deleteTarget, setDeleteTarget] = useState<Event | null>(null)

	// The status change and the deletion are not forms — no fields, so nothing to
	// put an error on but `root`. They keep their toasts, and read them off the
	// same `{ success, errors }` contract as every action in the app.
	const statusFetcher = useActionFetcher<typeof action>()
	const deleteFetcher = useActionFetcher<typeof action>()

	// The action answers `{ success }` and the loader revalidates on its own, so
	// the new status is not sent back — the requested one is what the toast names.
	const [requestedStatus, setRequestedStatus] = useState<EventStatus | null>(
		null,
	)

	useEffect(() => {
		if (!requestedStatus) return

		if (statusFetcher.isOk) {
			setRequestedStatus(null)
			toast.success(
				`Événement mis à jour — ${STATUS_CONFIG[requestedStatus].label}`,
			)
			return
		}

		if (statusFetcher.errors?.root) {
			setRequestedStatus(null)
			toast.error(
				statusFetcher.errors.root.message ??
					'Impossible de mettre à jour le statut',
			)
		}
	}, [requestedStatus, statusFetcher.isOk, statusFetcher.errors])

	useEffect(() => {
		if (!deleteTarget) return

		if (deleteFetcher.isOk) {
			toast.success('Événement supprimé')
			setDeleteTarget(null)
			return
		}

		if (deleteFetcher.errors?.root) {
			toast.error(
				deleteFetcher.errors.root.message ??
					"Impossible de supprimer l'événement",
			)
			setDeleteTarget(null)
		}
	}, [deleteTarget, deleteFetcher.isOk, deleteFetcher.errors])

	const handleFilterChange = (value: string) => {
		const next = new URLSearchParams(searchParams)
		if (value === 'all') {
			next.delete('status')
		} else {
			next.set('status', value)
		}
		setSearchParams(next)
	}

	const handleStatusUpdate = (id: string, status: EventStatus) => {
		setRequestedStatus(status)
		void statusFetcher.submit(
			{ intent: 'update-status', id, status },
			{ method: 'post' },
		)
	}

	const handleDelete = () => {
		if (!deleteTarget) return
		void deleteFetcher.submit(
			{ intent: 'delete', id: deleteTarget.id },
			{ method: 'post' },
		)
	}

	const handleEdit = (ev: Event) => {
		setEditingEvent(ev)
		setFormOpen(true)
	}

	const handleCreate = () => {
		setEditingEvent(null)
		setFormOpen(true)
	}

	const columns: ColumnDef<Event>[] = [
		{
			accessorKey: 'title',
			header: 'Événement',
			cell: ({ row }) => (
				<div>
					<p className="text-sm font-medium">{row.original.title}</p>
					<p className="text-muted-foreground flex items-center gap-1 text-xs">
						<MapPin className="h-3 w-3" />
						{row.original.ville}
						{row.original.commune ? ` · ${row.original.commune}` : ''}
					</p>
				</div>
			),
		},
		{
			accessorKey: 'eventDate',
			header: 'Date',
			cell: ({ row }) =>
				format(new Date(row.original.eventDate), "dd MMM yyyy 'à' HH:mm", {
					locale: fr,
				}),
		},
		{
			accessorKey: 'location',
			header: 'Lieu',
			cell: ({ row }) => (
				<span className="text-muted-foreground max-w-40 truncate text-sm">
					{row.original.location}
				</span>
			),
		},
		{
			accessorKey: 'status',
			header: 'Statut',
			cell: ({ row }) => {
				const cfg = STATUS_CONFIG[row.original.status]
				return <Badge className={cfg.className}>{cfg.label}</Badge>
			},
		},
		{
			accessorKey: 'createdAt',
			header: 'Créé le',
			cell: ({ row }) =>
				format(new Date(row.original.createdAt), 'dd MMM yyyy', { locale: fr }),
		},
		{
			id: 'actions',
			header: 'Actions',
			cell: ({ row }) => {
				const ev = row.original
				return (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon" className="h-8 w-8">
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-52">
							{ev.status === 'draft' && (
								<DropdownMenuItem
									onClick={() => handleStatusUpdate(ev.id, 'published')}
								>
									<CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
									Publier
								</DropdownMenuItem>
							)}
							{ev.status === 'published' && (
								<DropdownMenuItem
									onClick={() => handleStatusUpdate(ev.id, 'draft')}
								>
									<FileEdit className="mr-2 h-4 w-4 text-yellow-600" />
									Repasser en brouillon
								</DropdownMenuItem>
							)}
							{ev.status !== 'cancelled' && (
								<DropdownMenuItem
									onClick={() => handleStatusUpdate(ev.id, 'cancelled')}
								>
									<XCircle className="mr-2 h-4 w-4 text-red-600" />
									Annuler l&apos;événement
								</DropdownMenuItem>
							)}
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={() => handleEdit(ev)}>
								<Pencil className="mr-2 h-4 w-4" />
								Modifier
							</DropdownMenuItem>
							<DropdownMenuItem
								className="text-destructive focus:text-destructive"
								onClick={() => setDeleteTarget(ev)}
							>
								<Trash2 className="mr-2 h-4 w-4" /> Supprimer
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				)
			},
		},
	]

	return (
		<>
			<div>
				<div className="space-y-4 p-4 lg:p-6">
					<EventsStatsGrid events={events} total={total} />

					<BentoCard variant="table">
						<div className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
							<Select value={statusFilter} onValueChange={handleFilterChange}>
								<SelectTrigger className="h-9 w-44">
									<SelectValue placeholder="Statut" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Tous les statuts</SelectItem>
									<SelectItem value="draft">Brouillons</SelectItem>
									<SelectItem value="published">Publiés</SelectItem>
									<SelectItem value="cancelled">Annulés</SelectItem>
								</SelectContent>
							</Select>
							<Button size="sm" onClick={handleCreate}>
								<Plus className="mr-2 h-4 w-4" />
								Nouvel événement
							</Button>
						</div>
						<div className="p-4">
							<DataTable
								columns={columns}
								data={events}
								searchKey="title"
								searchPlaceholder="Rechercher un événement..."
							/>
						</div>
					</BentoCard>
				</div>
			</div>

			<EventFormDialog
				open={formOpen}
				onOpenChange={open => {
					setFormOpen(open)
					if (!open) setEditingEvent(null)
				}}
				event={editingEvent}
			/>

			<AlertDialog
				open={!!deleteTarget}
				onOpenChange={open => !open && setDeleteTarget(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Supprimer l&apos;événement ?</AlertDialogTitle>
						<AlertDialogDescription>
							Cette action est irréversible.{' '}
							<strong>{deleteTarget?.title}</strong> sera définitivement
							supprimé.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Annuler</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Supprimer
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
