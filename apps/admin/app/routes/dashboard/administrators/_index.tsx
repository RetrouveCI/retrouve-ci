import { useEffect, useState } from 'react'
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
} from '@app/ui/components'
import { BentoCard } from '@/components/bento-card'
import { DataTable } from '@/components/data-table'
import { STATUS_TONE_CLASSES } from '@/shared/constants/status-tone'
import { AdminStatsGrid } from './components/admin-stats-grid'
import { AdminCreateDialog } from './components/admin-create-dialog'
import { AdminRoleDialog } from './components/admin-role-dialog'
import { useActionFetcher } from '@/shared/hooks/use-action-fetcher'
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
import type {
	Admin,
	AdminRole,
	AdminStatus,
} from './types/administrators.types'
import type { RouteHandle } from '@/shared/helpers/page-meta'
import type { Route } from './+types/_index'

export const loader = administratorsLoader
export const action = administratorsAction

export const handle: RouteHandle = { title: 'Administrateurs' }

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

export default function AdministratorsPage({
	loaderData,
}: Route.ComponentProps) {
	const { admins } = loaderData

	const [statusFilter, setStatusFilter] = useState<string>('all')
	const [createOpen, setCreateOpen] = useState(false)
	const [roleTarget, setRoleTarget] = useState<Admin | null>(null)
	const [deleteTarget, setDeleteTarget] = useState<Admin | null>(null)
	const [resetTarget, setResetTarget] = useState<Admin | null>(null)

	// The three row actions are not forms — no fields, so nothing to put an error
	// on but `root`. They keep their toasts, and read them off the same
	// `{ success, errors }` contract as every action in the app. A fetcher action
	// revalidates the loader on its own, so no explicit revalidation here.
	const toggleFetcher = useActionFetcher<typeof action>()
	const deleteFetcher = useActionFetcher<typeof action>()
	const resetFetcher = useActionFetcher<typeof action>()

	// The action answers `{ success }`, so the requested status is what the toast
	// names. These flags are also what keeps each effect from replaying, since
	// `isOk` stays true afterwards — and they cannot be the dialog's own state:
	// `AlertDialogAction` closes it on click, well before the fetcher settles.
	const [requestedStatus, setRequestedStatus] = useState<AdminStatus | null>(
		null,
	)
	const [deleteSubmitted, setDeleteSubmitted] = useState(false)
	const [resetSubmitted, setResetSubmitted] = useState(false)

	useEffect(() => {
		if (!requestedStatus) return

		if (toggleFetcher.isOk) {
			setRequestedStatus(null)
			toast.success(
				requestedStatus === 'inactive' ? 'Compte désactivé' : 'Compte activé',
			)
			return
		}

		if (toggleFetcher.errors?.root) {
			setRequestedStatus(null)
			toast.error(
				toggleFetcher.errors.root.message ??
					'Impossible de changer le statut du compte',
			)
		}
	}, [requestedStatus, toggleFetcher.isOk, toggleFetcher.errors])

	useEffect(() => {
		if (!deleteSubmitted) return

		if (deleteFetcher.isOk) {
			setDeleteSubmitted(false)
			toast.success('Administrateur supprimé')
			setDeleteTarget(null)
			return
		}

		if (deleteFetcher.errors?.root) {
			setDeleteSubmitted(false)
			toast.error(
				deleteFetcher.errors.root.message ??
					"Impossible de supprimer l'administrateur",
			)
			setDeleteTarget(null)
		}
	}, [deleteSubmitted, deleteFetcher.isOk, deleteFetcher.errors])

	useEffect(() => {
		if (!resetSubmitted) return

		if (resetFetcher.isOk) {
			setResetSubmitted(false)
			toast.success('Email de réinitialisation envoyé')
			setResetTarget(null)
			return
		}

		if (resetFetcher.errors?.root) {
			setResetSubmitted(false)
			toast.error(
				resetFetcher.errors.root.message ??
					"Impossible d'envoyer l'email de réinitialisation",
			)
			setResetTarget(null)
		}
	}, [resetSubmitted, resetFetcher.isOk, resetFetcher.errors])

	const handleToggleStatus = (admin: Admin) => {
		const newStatus: AdminStatus =
			admin.status === 'active' ? 'inactive' : 'active'
		setRequestedStatus(newStatus)
		void toggleFetcher.submit(
			{ intent: 'toggle-status', id: admin.id, status: newStatus },
			{ method: 'post' },
		)
	}

	const handleDelete = () => {
		if (!deleteTarget) return
		setDeleteSubmitted(true)
		void deleteFetcher.submit(
			{ intent: 'delete', id: deleteTarget.id },
			{ method: 'post' },
		)
	}

	const handleResetPassword = () => {
		if (!resetTarget) return
		setResetSubmitted(true)
		void resetFetcher.submit(
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
							? STATUS_TONE_CLASSES.success
							: STATUS_TONE_CLASSES.neutral
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
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								aria-label={`Actions pour ${admin.name}`}
							>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-52">
							<DropdownMenuItem
								onClick={() => setRoleTarget(admin)}
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
			<div>
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
							<Button size="sm" onClick={() => setCreateOpen(true)}>
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

			<AdminCreateDialog open={createOpen} onOpenChange={setCreateOpen} />

			<AdminRoleDialog
				open={!!roleTarget}
				onOpenChange={open => !open && setRoleTarget(null)}
				admin={roleTarget}
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
