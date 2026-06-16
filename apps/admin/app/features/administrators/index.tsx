import { useEffect, useState } from 'react'
import { useFetcher, useRevalidator } from 'react-router'
import {
	Avatar,
	AvatarFallback,
	Badge,
	Button,
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
} from '@retrouve-ci/ui/components'
import { TopBar } from '@/shared/components/topbar'
import { BentoCard } from '@/shared/components/bento-card'
import { DataTable } from '@/shared/components/data-table'
import { AdminStatsGrid } from './components/admin-stats-grid'
import { AdminFormDialog } from './components/admin-form-dialog'
import { administratorsLoader } from './servers/administrators.loader'
import { administratorsAction } from './servers/administrators.action'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import {
	MoreHorizontal,
	Plus,
	Edit,
	Ban,
	Trash2,
	Key,
	Shield,
	ShieldCheck,
	ShieldAlert,
} from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type { Admin, AdminRole, AdminStatus } from './administrators.types'
import type { Route } from './+types/index'

export const loader = administratorsLoader
export const action = administratorsAction

const ROLE_CONFIG: Record<
	AdminRole,
	{
		label: string
		icon: React.ElementType
		variant: 'default' | 'secondary' | 'outline'
	}
> = {
	super_admin: { label: 'Super Admin', icon: ShieldCheck, variant: 'default' },
	admin: { label: 'Admin', icon: Shield, variant: 'secondary' },
	moderator: { label: 'Modérateur', icon: ShieldAlert, variant: 'outline' },
}

interface MutationResult {
	ok: boolean
	intent?: string
	status?: string
	error?: string
}

export default function AdministratorsPage({
	loaderData,
}: Route.ComponentProps) {
	const { admins } = loaderData
	const revalidator = useRevalidator()

	const [statusFilter, setStatusFilter] = useState<string>('all')
	const [formOpen, setFormOpen] = useState(false)
	const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null)
	const [deleteTarget, setDeleteTarget] = useState<Admin | null>(null)
	const [resetTarget, setResetTarget] = useState<Admin | null>(null)

	const toggleFetcher = useFetcher<MutationResult>()
	const deleteFetcher = useFetcher<MutationResult>()
	const resetFetcher = useFetcher<MutationResult>()

	useEffect(() => {
		if (toggleFetcher.state !== 'idle' || !toggleFetcher.data) return

		if (toggleFetcher.data.ok) {
			toast.success(
				toggleFetcher.data.status === 'inactive'
					? 'Compte désactivé'
					: 'Compte activé',
			)
			revalidator.revalidate()
		} else if (toggleFetcher.data.error) {
			toast.error(toggleFetcher.data.error)
		}
	}, [toggleFetcher.state, toggleFetcher.data, revalidator])

	useEffect(() => {
		if (deleteFetcher.state !== 'idle' || !deleteFetcher.data) return

		if (deleteFetcher.data.ok) {
			toast.success('Administrateur supprimé')
			setDeleteTarget(null)
			revalidator.revalidate()
		} else if (deleteFetcher.data.error) {
			toast.error(deleteFetcher.data.error)
		}
	}, [deleteFetcher.state, deleteFetcher.data, revalidator])

	useEffect(() => {
		if (resetFetcher.state !== 'idle' || !resetFetcher.data) return

		if (resetFetcher.data.ok) {
			toast.success('Email de réinitialisation envoyé')
			setResetTarget(null)
		} else if (resetFetcher.data.error) {
			toast.error(resetFetcher.data.error)
		}
	}, [resetFetcher.state, resetFetcher.data])

	const handleFormSuccess = () => {
		revalidator.revalidate()
	}

	const handleToggleStatus = (admin: Admin) => {
		const newStatus: AdminStatus =
			admin.status === 'active' ? 'inactive' : 'active'
		toggleFetcher.submit(
			{ intent: 'toggle-status', id: admin.id, status: newStatus },
			{ method: 'post' },
		)
	}

	const handleDelete = () => {
		if (!deleteTarget) return
		deleteFetcher.submit(
			{ intent: 'delete', id: deleteTarget.id },
			{ method: 'post' },
		)
	}

	const handleResetPassword = () => {
		if (!resetTarget) return
		resetFetcher.submit(
			{ intent: 'reset-password', email: resetTarget.email },
			{ method: 'post' },
		)
	}

	const filtered =
		statusFilter === 'all'
			? admins
			: admins.filter(a => a.status === statusFilter)

	const counts = {
		total: admins.length,
		active: admins.filter(a => a.status === 'active').length,
		superAdmins: admins.filter(a => a.role === 'super_admin').length,
	}

	const columns: ColumnDef<Admin>[] = [
		{
			accessorKey: 'name',
			header: 'Administrateur',
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
				<span className="text-muted-foreground font-mono text-sm">
					{row.original.phone ?? '—'}
				</span>
			),
		},
		{
			accessorKey: 'role',
			header: 'Rôle',
			cell: ({ row }) => {
				const cfg = ROLE_CONFIG[row.original.role]
				const Icon = cfg.icon
				return (
					<Badge variant={cfg.variant} className="gap-1">
						<Icon className="h-3.5 w-3.5" />
						{cfg.label}
					</Badge>
				)
			},
		},
		{
			accessorKey: 'status',
			header: 'Statut',
			cell: ({ row }) => (
				<Badge
					className={
						row.original.status === 'active'
							? 'bg-green-100 text-green-700 hover:bg-green-100'
							: 'bg-gray-100 text-gray-600 hover:bg-gray-100'
					}
				>
					{row.original.status === 'active' ? 'Actif' : 'Inactif'}
				</Badge>
			),
		},
		{
			accessorKey: 'lastLogin',
			header: 'Dernière connexion',
			cell: ({ row }) => (
				<span className="text-muted-foreground text-sm">
					{row.original.lastLogin
						? format(new Date(row.original.lastLogin), 'dd/MM/yyyy HH:mm', {
								locale: fr,
							})
						: 'Jamais'}
				</span>
			),
		},
		{
			id: 'actions',
			cell: ({ row }) => {
				const admin = row.original
				const isSuperAdmin = admin.role === 'super_admin'
				return (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon" className="h-8 w-8">
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-52">
							<DropdownMenuItem
								onClick={() => {
									setEditingAdmin(admin)
									setFormOpen(true)
								}}
								disabled={isSuperAdmin}
							>
								<Edit className="mr-2 h-4 w-4" /> Modifier le rôle
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setResetTarget(admin)}>
								<Key className="mr-2 h-4 w-4" /> Réinitialiser le mot de passe
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={() => handleToggleStatus(admin)}
								disabled={isSuperAdmin}
							>
								<Ban className="mr-2 h-4 w-4" />
								{admin.status === 'active' ? 'Désactiver' : 'Activer'}
							</DropdownMenuItem>
							<DropdownMenuItem
								className="text-destructive focus:text-destructive"
								onClick={() => setDeleteTarget(admin)}
								disabled={isSuperAdmin}
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
			<TopBar title="Administrateurs" />
			<div className="pt-16">
				<div className="space-y-4 p-4 lg:p-6">
					<AdminStatsGrid
						total={counts.total}
						active={counts.active}
						superAdmins={counts.superAdmins}
					/>

					<BentoCard variant="table">
						<div className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
							<Select value={statusFilter} onValueChange={setStatusFilter}>
								<SelectTrigger className="h-9 w-40">
									<SelectValue placeholder="Statut" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Tous</SelectItem>
									<SelectItem value="active">Actifs</SelectItem>
									<SelectItem value="inactive">Inactifs</SelectItem>
								</SelectContent>
							</Select>
							<Button
								size="sm"
								onClick={() => {
									setEditingAdmin(null)
									setFormOpen(true)
								}}
							>
								<Plus className="mr-2 h-4 w-4" /> Ajouter un admin
							</Button>
						</div>
						<div className="p-4">
							<DataTable
								columns={columns}
								data={filtered}
								searchKey="name"
								searchPlaceholder="Rechercher par nom..."
							/>
						</div>
					</BentoCard>
				</div>
			</div>

			<AdminFormDialog
				open={formOpen}
				onOpenChange={open => {
					setFormOpen(open)
					if (!open) setEditingAdmin(null)
				}}
				admin={editingAdmin}
				onSuccess={handleFormSuccess}
			/>

			<AlertDialog
				open={!!deleteTarget}
				onOpenChange={open => !open && setDeleteTarget(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Supprimer l&apos;administrateur ?
						</AlertDialogTitle>
						<AlertDialogDescription>
							Cette action est irréversible.{' '}
							<strong>{deleteTarget?.name}</strong> perdra l&apos;accès à
							l&apos;administration.
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

			<AlertDialog
				open={!!resetTarget}
				onOpenChange={open => !open && setResetTarget(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Réinitialiser le mot de passe ?</AlertDialogTitle>
						<AlertDialogDescription>
							Un email de réinitialisation sera envoyé à{' '}
							<strong>{resetTarget?.email}</strong>.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Annuler</AlertDialogCancel>
						<AlertDialogAction onClick={handleResetPassword}>
							Envoyer l&apos;email
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
