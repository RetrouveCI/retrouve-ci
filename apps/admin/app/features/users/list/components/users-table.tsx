import { Link } from 'react-router'
import {
	Avatar,
	AvatarFallback,
	Badge,
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@retrouve-ci/ui/components'
import { DataTable } from '@/shared/components/data-table'
import { STATUS_TONE_CLASSES } from '@/shared/lib/status-tone'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Eye, MoreHorizontal, Ban, CheckCircle } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type { User } from '../../users.types'

interface UsersTableProps {
	data: User[]
	onToggleBan: (user: User) => void
	isBusy: boolean
}

export function UsersTable({ data, onToggleBan, isBusy }: UsersTableProps) {
	const columns: ColumnDef<User>[] = [
		{
			accessorKey: 'name',
			header: 'Utilisateur',
			cell: ({ row }) => (
				<div className="flex items-center gap-3">
					<Avatar className="h-8 w-8">
						<AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
							{row.original.name.charAt(0)}
						</AvatarFallback>
					</Avatar>
					<div>
						<p className="text-sm font-medium">{row.original.name}</p>
						<p className="text-muted-foreground text-xs">
							{row.original.email}
						</p>
					</div>
				</div>
			),
		},
		{
			accessorKey: 'phone',
			header: 'Téléphone',
			cell: ({ row }) => (
				<span className="font-mono text-sm">{row.original.phone ?? '—'}</span>
			),
		},
		{
			accessorKey: 'createdAt',
			header: 'Inscription',
			cell: ({ row }) =>
				format(new Date(row.original.createdAt), 'dd MMM yyyy', { locale: fr }),
		},
		{
			accessorKey: 'status',
			header: 'Statut',
			cell: ({ row }) => (
				<Badge
					className={
						row.original.status === 'active'
							? STATUS_TONE_CLASSES.success
							: STATUS_TONE_CLASSES.neutral
					}
				>
					{row.original.status === 'active' ? 'Actif' : 'Inactif'}
				</Badge>
			),
		},
		{
			id: 'actions',
			header: 'Actions',
			cell: ({ row }) => {
				const user = row.original
				return (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								disabled={isBusy}
							>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-48">
							<DropdownMenuItem asChild>
								<Link to={`/users/${user.id}`}>
									<Eye className="mr-2 h-4 w-4" /> Voir le profil
								</Link>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={() => onToggleBan(user)}>
								{user.status === 'active' ? (
									<>
										<Ban className="mr-2 h-4 w-4" /> Désactiver
									</>
								) : (
									<>
										<CheckCircle className="mr-2 h-4 w-4" /> Activer
									</>
								)}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				)
			},
		},
	]

	return (
		<DataTable
			columns={columns}
			data={data}
			searchKey="name"
			searchPlaceholder="Rechercher par nom, email..."
		/>
	)
}
