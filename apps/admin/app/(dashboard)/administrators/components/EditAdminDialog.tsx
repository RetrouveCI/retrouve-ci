import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@retrouve-ci/ui/components'

interface EditAdminForm {
	name: string
	email: string
	phone: string
	role: 'super_admin' | 'admin' | 'moderator'
}

interface EditAdminDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	adminName?: string
	form: EditAdminForm
	onFormChange: (form: EditAdminForm) => void
	onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
	isSubmitting: boolean
}

export function EditAdminDialog({
	open,
	onOpenChange,
	adminName,
	form,
	onFormChange,
	onSubmit,
	isSubmitting,
}: EditAdminDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Modifier l&apos;administrateur</DialogTitle>
					<DialogDescription>
						Modifiez les informations de {adminName}
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={onSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="edit-name">Nom complet</Label>
						<Input
							id="edit-name"
							value={form.name}
							onChange={e => onFormChange({ ...form, name: e.target.value })}
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="edit-email">Email</Label>
						<Input
							id="edit-email"
							type="email"
							value={form.email}
							onChange={e => onFormChange({ ...form, email: e.target.value })}
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="edit-phone">Téléphone</Label>
						<Input
							id="edit-phone"
							value={form.phone}
							onChange={e => onFormChange({ ...form, phone: e.target.value })}
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="edit-role">Rôle</Label>
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
							{isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
