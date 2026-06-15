'use client'

import { Badge, Button } from '@retrouve-ci/ui/components'
import { useState } from 'react'
import { TopBar } from '@/components/topbar'
import { BentoCard } from '@/components/bento-card'
import { DataTable } from '@/components/data-table'
import { cn } from '@retrouve-ci/ui/utils'
import { useContactMessages } from '@/application/contact-messages/use-contact-messages'
import type { ContactMessage } from '@/domain/entities/contact-message'
import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Eye } from 'lucide-react'
import { toast } from 'sonner'
import { ContactMessageDetailDialog } from './components/ContactMessageDetailDialog'

const statusConfig: Record<
	ContactMessage['status'],
	{ label: string; className: string }
> = {
	new: {
		label: 'Nouveau',
		className: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
	},
	read: {
		label: 'Lu',
		className: 'bg-muted text-muted-foreground hover:bg-muted',
	},
	archived: {
		label: 'Archivé',
		className: 'bg-gray-100 text-gray-700 hover:bg-gray-100',
	},
}

const statusFilters = ['all', 'new', 'read', 'archived'] as const

export default function ContactMessagesPage() {
	const [statusFilter, setStatusFilter] =
		useState<(typeof statusFilters)[number]>('all')
	const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
		null,
	)
	const [detailOpen, setDetailOpen] = useState(false)

	const { messages, isLoading, error, view, archive } = useContactMessages(
		statusFilter === 'all' ? undefined : statusFilter,
	)

	const handleView = async (message: ContactMessage) => {
		const fresh = await view(message.id)
		setSelectedMessage(fresh)
		setDetailOpen(true)
	}

	const handleArchive = async (id: string) => {
		await archive(id)
		setSelectedMessage(prev =>
			prev && prev.id === id ? { ...prev, status: 'archived' } : prev,
		)
		toast.success('Message archivé')
	}

	const columns: ColumnDef<ContactMessage>[] = [
		{
			accessorKey: 'createdAt',
			header: 'Date',
			cell: ({ row }) =>
				format(new Date(row.original.createdAt), 'dd MMM yyyy', {
					locale: fr,
				}),
		},
		{
			accessorKey: 'name',
			header: 'Nom',
			cell: ({ row }) => (
				<div>
					<p className="text-sm font-medium">{row.original.name}</p>
					<p className="text-muted-foreground text-xs">
						{row.original.email}
					</p>
				</div>
			),
		},
		{
			accessorKey: 'subject',
			header: 'Sujet',
			cell: ({ row }) => (
				<span className="text-sm">{row.original.subject}</span>
			),
		},
		{
			accessorKey: 'status',
			header: 'Statut',
			cell: ({ row }) => {
				const cfg = statusConfig[row.original.status]
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
			<TopBar title="Messages de contact" />
			<div className="pt-16">
				<div className="space-y-4 p-4 lg:p-6">
					<BentoCard variant="table">
						<div className="flex flex-wrap items-center gap-2 border-b px-5 py-4">
							{statusFilters.map(val => (
								<button
									key={val}
									onClick={() => setStatusFilter(val)}
									className={cn(
										'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
										statusFilter === val
											? 'bg-primary text-primary-foreground'
											: 'bg-muted text-muted-foreground hover:bg-muted/80',
									)}
								>
									{val === 'all'
										? 'Tous'
										: val === 'new'
											? 'Nouveaux'
											: val === 'read'
												? 'Lus'
												: 'Archivés'}
								</button>
							))}
						</div>
						<div className="p-4">
							{error ? (
								<p className="text-destructive py-8 text-center text-sm">
									{error}
								</p>
							) : (
								<DataTable
									columns={columns}
									data={messages}
									searchKey="subject"
									searchPlaceholder="Rechercher par sujet..."
								/>
							)}
							{isLoading && (
								<p className="text-muted-foreground py-4 text-center text-sm">
									Chargement...
								</p>
							)}
						</div>
					</BentoCard>
				</div>
			</div>

			<ContactMessageDetailDialog
				message={selectedMessage}
				open={detailOpen}
				onOpenChange={setDetailOpen}
				onArchive={handleArchive}
			/>
		</>
	)
}
