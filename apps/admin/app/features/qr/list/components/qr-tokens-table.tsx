import { Link } from 'react-router'
import {
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
import { MoreHorizontal, Eye, Copy, Link as LinkIcon, Ban } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type { QrToken } from '../../qr.types'

const STATUS_LABEL: Record<string, string> = {
	generated: 'Généré',
	activated: 'Activé',
	revoked: 'Révoqué',
}

const STATUS_CLASS: Record<string, string> = {
	activated: STATUS_TONE_CLASSES.success,
	generated: STATUS_TONE_CLASSES.info,
	revoked: STATUS_TONE_CLASSES.danger,
}

interface QrTokensTableProps {
	data: QrToken[]
	onCopy: (text: string, label: string) => void
}

export function QrTokensTable({ data, onCopy }: QrTokensTableProps) {
	const columns: ColumnDef<QrToken>[] = [
		{
			accessorKey: 'code',
			header: 'Token',
			cell: ({ row }) => (
				<span className="font-mono text-xs">{row.original.code}</span>
			),
		},
		{
			accessorKey: 'status',
			header: 'Statut',
			cell: ({ row }) => (
				<Badge className={STATUS_CLASS[row.original.status] ?? ''}>
					{STATUS_LABEL[row.original.status] ?? row.original.status}
				</Badge>
			),
		},
		{
			accessorKey: 'batch',
			header: 'Batch',
			cell: ({ row }) => (
				<span className="text-muted-foreground text-sm">
					{row.original.batch ?? '-'}
				</span>
			),
		},
		{
			accessorKey: 'createdAt',
			header: 'Créé le',
			cell: ({ row }) =>
				format(new Date(row.original.createdAt), 'dd MMM yyyy', { locale: fr }),
		},
		{
			accessorKey: 'activatedAt',
			header: 'Activé le',
			cell: ({ row }) =>
				row.original.activatedAt
					? format(new Date(row.original.activatedAt), 'dd MMM yyyy', {
							locale: fr,
						})
					: '-',
		},
		{
			accessorKey: 'userId',
			header: 'Utilisateur',
			cell: ({ row }) =>
				row.original.userId ? (
					<Link
						to={`/users/${row.original.userId}`}
						className="text-primary text-sm hover:underline"
					>
						Voir
					</Link>
				) : (
					<span className="text-muted-foreground">-</span>
				),
		},
		{
			id: 'actions',
			header: 'Actions',
			cell: ({ row }) => (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon" className="h-8 w-8">
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem asChild>
							<Link to={`/qr/${row.original.code}`}>
								<Eye className="mr-2 h-4 w-4" /> Voir détails
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => onCopy(row.original.code, 'Token')}
						>
							<Copy className="mr-2 h-4 w-4" /> Copier le token
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() =>
								onCopy(
									`${import.meta.env.VITE_API_URL?.replace(':3002', ':3000') ?? 'https://retrouveci.com'}/q/${row.original.code}`,
									'Lien',
								)
							}
						>
							<LinkIcon className="mr-2 h-4 w-4" /> Copier le lien
						</DropdownMenuItem>
						{row.original.status !== 'revoked' && (
							<>
								<DropdownMenuSeparator />
								<DropdownMenuItem asChild>
									<Link
										to={`/qr/${row.original.code}`}
										className="text-destructive focus:text-destructive"
									>
										<Ban className="mr-2 h-4 w-4" /> Révoquer
									</Link>
								</DropdownMenuItem>
							</>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			),
		},
	]

	return (
		<DataTable
			columns={columns}
			data={data}
			searchKey="code"
			searchPlaceholder="Rechercher par token..."
		/>
	)
}
