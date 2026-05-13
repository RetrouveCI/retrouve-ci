'use client'

import {
	Button,
	Badge,
	Avatar,
	AvatarFallback,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@retrouve-ci/ui/components'
import { useState } from 'react'
import { useAdministrators } from '@/application/administrators/use-administrators'
import type { Admin } from '@/domain/entities/admin'
import { TopBar } from '@/components/topbar'
import { DataTable } from '@/components/data-table'
import { BentoCard } from '@/components/bento-card'
import {
	MoreHorizontal,
	Plus,
	Edit,
	Ban,
	Trash2,
	Shield,
	ShieldCheck,
	ShieldAlert,
	Key,
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import type { ColumnDef } from '@tanstack/react-table'
import { AdminStatsGrid } from './components/AdminStatsGrid'
import { AddAdminDialog } from './components/AddAdminDialog'
import { EditAdminDialog } from './components/EditAdminDialog'
import { DeleteAdminDialog } from './components/DeleteAdminDialog'
import { ResetPasswordDialog } from './components/ResetPasswordDialog'

const getRoleLabel = (role: string) => {
	switch (role) {
		case 'super_admin':
			return 'Super Admin'
		case 'admin':
			return 'Admin'
		case 'moderator':
			return 'Modérateur'
		default:
			return role
	}
}

const getRoleIcon = (role: string) => {
	switch (role) {
		case 'super_admin':
			return <ShieldCheck className="h-3.5 w-3.5" />
		case 'admin':
			return <Shield className="h-3.5 w-3.5" />
		default:
			return <ShieldAlert className="h-3.5 w-3.5" />
	}
}

type AdminForm = {
	name: string
	email: string
	phone: string
	role: 'super_admin' | 'admin' | 'moderator'
}
const emptyForm: AdminForm = {
	name: '',
	email: '',
	phone: '',
	role: 'moderator',
}

export default function AdministratorsPage() {
	const [statusFilter, setStatusFilter] = useState<string>('all')
	const [showAddDialog, setShowAddDialog] = useState(false)
	const [showEditDialog, setShowEditDialog] = useState(false)
	const [showDeleteDialog, setShowDeleteDialog] = useState(false)
	const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false)
	const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [newAdminForm, setNewAdminForm] = useState<AdminForm>(emptyForm)
	const [editAdminForm, setEditAdminForm] = useState<AdminForm>(emptyForm)
	const { admins, create, update, updateStatus, remove } = useAdministrators()

	const filteredAdmins =
		statusFilter === 'all'
			? admins
			: admins.filter(a => a.status === statusFilter)

	const handleAddAdmin = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setIsSubmitting(true)
		await create(newAdminForm)
		setIsSubmitting(false)
		setShowAddDialog(false)
		setNewAdminForm(emptyForm)
		toast.success('Administrateur ajouté avec succès')
	}

	const handleEditAdmin = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (!selectedAdmin) return
		setIsSubmitting(true)
		await update(selectedAdmin.id, editAdminForm)
		setIsSubmitting(false)
		setShowEditDialog(false)
		setSelectedAdmin(null)
		toast.success('Administrateur mis à jour avec succès')
	}

	const handleDeleteAdmin = async () => {
		if (!selectedAdmin) return
		setIsSubmitting(true)
		await remove(selectedAdmin.id)
		setIsSubmitting(false)
		setShowDeleteDialog(false)
		setSelectedAdmin(null)
		toast.success('Administrateur supprimé avec succès')
	}

	const handleResetPassword = async () => {
		setIsSubmitting(true)
		await new Promise(r => setTimeout(r, 1000))
		setIsSubmitting(false)
		setShowResetPasswordDialog(false)
		setSelectedAdmin(null)
		toast.success('Email de réinitialisation envoyé')
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
				<span className="text-muted-foreground text-sm">
					{row.original.phone}
				</span>
			),
		},
		{
			accessorKey: 'role',
			header: 'Rôle',
			cell: ({ row }) => (
				<Badge
					variant={
						row.original.role === 'super_admin'
							? 'default'
							: row.original.role === 'admin'
								? 'secondary'
								: 'outline'
					}
					className="gap-1"
				>
					{getRoleIcon(row.original.role)}
					{getRoleLabel(row.original.role)}
				</Badge>
			),
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
						<DropdownMenuContent align="end">
							<DropdownMenuItem
								onClick={() => {
									setSelectedAdmin(admin)
									setEditAdminForm({
										name: admin.name,
										email: admin.email,
										phone: admin.phone,
										role: admin.role,
									})
									setShowEditDialog(true)
								}}
							>
								<Edit className="mr-2 h-4 w-4" /> Modifier
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => {
									setSelectedAdmin(admin)
									setShowResetPasswordDialog(true)
								}}
							>
								<Key className="mr-2 h-4 w-4" /> Réinitialiser le mot de passe
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={() => {
									const newStatus =
										admin.status === 'active' ? 'inactive' : 'active'
									updateStatus(admin.id, newStatus).then(() =>
										toast.success(
											`Compte ${admin.status === 'active' ? 'désactivé' : 'activé'}`,
										),
									)
								}}
								disabled={isSuperAdmin}
							>
								<Ban className="mr-2 h-4 w-4" />
								{admin.status === 'active' ? 'Désactiver' : 'Activer'}
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => {
									setSelectedAdmin(admin)
									setShowDeleteDialog(true)
								}}
								className="text-destructive focus:text-destructive"
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
						total={admins.length}
						active={admins.filter(a => a.status === 'active').length}
						superAdmins={admins.filter(a => a.role === 'super_admin').length}
					/>

					<BentoCard variant="table">
						<div className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
							<Select value={statusFilter} onValueChange={setStatusFilter}>
								<SelectTrigger className="h-9 w-[150px]">
									<SelectValue placeholder="Statut" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Tous</SelectItem>
									<SelectItem value="active">Actifs</SelectItem>
									<SelectItem value="inactive">Inactifs</SelectItem>
								</SelectContent>
							</Select>
							<Button size="sm" onClick={() => setShowAddDialog(true)}>
								<Plus className="mr-2 h-4 w-4" /> Ajouter un admin
							</Button>
						</div>
						<div className="p-4">
							<DataTable
								columns={columns}
								data={filteredAdmins}
								searchKey="name"
								searchPlaceholder="Rechercher par nom..."
							/>
						</div>
					</BentoCard>
				</div>
			</div>

			<AddAdminDialog
				open={showAddDialog}
				onOpenChange={setShowAddDialog}
				form={newAdminForm}
				onFormChange={setNewAdminForm}
				onSubmit={handleAddAdmin}
				isSubmitting={isSubmitting}
			/>
			<EditAdminDialog
				open={showEditDialog}
				onOpenChange={setShowEditDialog}
				adminName={selectedAdmin?.name}
				form={editAdminForm}
				onFormChange={setEditAdminForm}
				onSubmit={handleEditAdmin}
				isSubmitting={isSubmitting}
			/>
			<DeleteAdminDialog
				open={showDeleteDialog}
				onOpenChange={setShowDeleteDialog}
				adminName={selectedAdmin?.name}
				onConfirm={handleDeleteAdmin}
				isSubmitting={isSubmitting}
			/>
			<ResetPasswordDialog
				open={showResetPasswordDialog}
				onOpenChange={setShowResetPasswordDialog}
				adminEmail={selectedAdmin?.email}
				onConfirm={handleResetPassword}
				isSubmitting={isSubmitting}
			/>
		</>
	)
}
