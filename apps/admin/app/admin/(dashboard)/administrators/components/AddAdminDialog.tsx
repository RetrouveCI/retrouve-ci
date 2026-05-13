import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@retrouve-ci/ui/components'

interface AddAdminForm {
	name: string
	email: string
	phone: string
	role: 'super_admin' | 'admin' | 'moderator'
}

interface AddAdminDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	form: AddAdminForm
	onFormChange: (form: AddAdminForm) => void
	onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
	isSubmitting: boolean
}

export function AddAdminDialog({
	open,
	onOpenChange,
	form,
	onFormChange,
	onSubmit,
	isSubmitting,
}: AddAdminDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Ajouter un administrateur</DialogTitle>
					<DialogDescription>
						Créez un nouveau compte. Un email avec les identifiants sera envoyé.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={onSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="name">Nom complet</Label>
						<Input
							id="name"
							value={form.name}
							onChange={e => onFormChange({ ...form, name: e.target.value })}
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							value={form.email}
							onChange={e => onFormChange({ ...form, email: e.target.value })}
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="phone">Téléphone</Label>
						<Input
							id="phone"
							value={form.phone}
							onChange={e => onFormChange({ ...form, phone: e.target.value })}
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="role">Rôle</Label>
						<Select
							value={form.role}
							onValueChange={(v: 'admin' | 'moderator') =>
								onFormChange({ ...form, role: v })
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
						<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
							Annuler
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? 'Création...' : 'Créer le compte'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
