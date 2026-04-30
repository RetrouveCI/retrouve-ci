'use client'

import { useState } from 'react'
import { mockAdmins } from '@/lib/mock-data'
import type { Admin } from '@/lib/types'
import { TopBar } from '@/components/admin/topbar'
import { DataTable } from '@/components/admin/data-table'
import { BentoCard } from '@/components/admin/bento-card'
import { Button } from '@retrouve-ci/ui/components/ui/button'
import { Badge } from '@retrouve-ci/ui/components/ui/badge'
import { Avatar, AvatarFallback } from '@retrouve-ci/ui/components/ui/avatar'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@retrouve-ci/ui/components/ui/dialog'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@retrouve-ci/ui/components/ui/dropdown-menu'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@retrouve-ci/ui/components/ui/select'
import { Input } from '@retrouve-ci/ui/components/ui/input'
import { Label } from '@retrouve-ci/ui/components/ui/label'
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
	Users,
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import type { ColumnDef } from '@tanstack/react-table'

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

export default function AdministratorsPage() {
	const [statusFilter, setStatusFilter] = useState<string>('all')
	const [showAddDialog, setShowAddDialog] = useState(false)
	const [showEditDialog, setShowEditDialog] = useState(false)
	const [showDeleteDialog, setShowDeleteDialog] = useState(false)
	const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false)
	const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [newAdminForm, setNewAdminForm] = useState({
		name: '',
		email: '',
		phone: '',
		role: 'moderator' as 'super_admin' | 'admin' | 'moderator',
	})

	const filteredAdmins =
		statusFilter === 'all'
			? mockAdmins
			: mockAdmins.filter(a => a.status === statusFilter)

	const totalAdmins = mockAdmins.length
	const activeAdmins = mockAdmins.filter(a => a.status === 'active').length
	const superAdmins = mockAdmins.filter(a => a.role === 'super_admin').length

	const handleAddAdmin = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsSubmitting(true)
		await new Promise(r => setTimeout(r, 1000))
		setIsSubmitting(false)
		setShowAddDialog(false)
		setNewAdminForm({ name: '', email: '', phone: '', role: 'moderator' })
		toast.success('Administrateur ajouté avec succès')
	}

	const handleEditAdmin = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsSubmitting(true)
		await new Promise(r => setTimeout(r, 1000))
		setIsSubmitting(false)
		setShowEditDialog(false)
		setSelectedAdmin(null)
		toast.success('Administrateur mis à jour avec succès')
	}

	const handleDeleteAdmin = async () => {
		setIsSubmitting(true)
		await new Promise(r => setTimeout(r, 1000))
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
								onClick={() =>
									toast.success(
										`Compte ${admin.status === 'active' ? 'désactivé' : 'activé'}`,
									)
								}
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
					{/* Bento stat grid */}
					<div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
						<BentoCard
							variant="highlight"
							title="Total admins"
							value={totalAdmins}
							icon={Users}
						/>
						<BentoCard
							variant="stat"
							title="Actifs"
							value={activeAdmins}
							icon={ShieldCheck}
							iconColor="text-green-600"
							iconBgColor="bg-green-100"
						/>
						<BentoCard
							variant="stat"
							title="Super admins"
							value={superAdmins}
							icon={Shield}
							iconColor="text-primary"
							iconBgColor="bg-primary/10"
							className="col-span-2 lg:col-span-1"
						/>
					</div>

					{/* Table bento card */}
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

			{/* Add Admin Dialog */}
			<Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Ajouter un administrateur</DialogTitle>
						<DialogDescription>
							Créez un nouveau compte. Un email avec les identifiants sera
							envoyé.
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleAddAdmin} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Nom complet</Label>
							<Input
								id="name"
								value={newAdminForm.name}
								onChange={e =>
									setNewAdminForm(p => ({ ...p, name: e.target.value }))
								}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								value={newAdminForm.email}
								onChange={e =>
									setNewAdminForm(p => ({ ...p, email: e.target.value }))
								}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="phone">Téléphone</Label>
							<Input
								id="phone"
								value={newAdminForm.phone}
								onChange={e =>
									setNewAdminForm(p => ({ ...p, phone: e.target.value }))
								}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="role">Rôle</Label>
							<Select
								value={newAdminForm.role}
								onValueChange={(v: 'admin' | 'moderator') =>
									setNewAdminForm(p => ({ ...p, role: v }))
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="admin">Administrateur</SelectItem>
									<SelectItem value="moderator">Modérateur</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setShowAddDialog(false)}
							>
								Annuler
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? 'Création...' : 'Créer le compte'}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Edit Admin Dialog */}
			<Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Modifier l&apos;administrateur</DialogTitle>
						<DialogDescription>
							Modifiez les informations de {selectedAdmin?.name}
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleEditAdmin} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="edit-name">Nom complet</Label>
							<Input
								id="edit-name"
								defaultValue={selectedAdmin?.name}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="edit-email">Email</Label>
							<Input
								id="edit-email"
								type="email"
								defaultValue={selectedAdmin?.email}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="edit-phone">Téléphone</Label>
							<Input
								id="edit-phone"
								defaultValue={selectedAdmin?.phone}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="edit-role">Rôle</Label>
							<Select defaultValue={selectedAdmin?.role}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="admin">Administrateur</SelectItem>
									<SelectItem value="moderator">Modérateur</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setShowEditDialog(false)}
							>
								Annuler
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Delete Admin Dialog */}
			<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Supprimer l&apos;administrateur</DialogTitle>
						<DialogDescription>
							Êtes-vous sûr de vouloir supprimer le compte de{' '}
							{selectedAdmin?.name} ? Cette action est irréversible.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowDeleteDialog(false)}
						>
							Annuler
						</Button>
						<Button
							variant="destructive"
							onClick={handleDeleteAdmin}
							disabled={isSubmitting}
						>
							{isSubmitting ? 'Suppression...' : 'Supprimer'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Reset Password Dialog */}
			<Dialog
				open={showResetPasswordDialog}
				onOpenChange={setShowResetPasswordDialog}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Réinitialiser le mot de passe</DialogTitle>
						<DialogDescription>
							Un email sera envoyé à {selectedAdmin?.email} pour définir un
							nouveau mot de passe.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowResetPasswordDialog(false)}
						>
							Annuler
						</Button>
						<Button onClick={handleResetPassword} disabled={isSubmitting}>
							{isSubmitting ? 'Envoi...' : "Envoyer l'email"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	)
}
