import { useEffect } from 'react'
import { useFetcher } from 'react-router'
import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	Input,
	Field,
	FieldGroup,
	FieldLabel,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@retrouve-ci/ui/components'
import { FieldError } from '@retrouve-ci/ui/components/form'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
	useForm,
	useInputControl,
	getFormProps,
	getInputProps,
} from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { adminFormSchema } from '../administrators.schema'
import type { Admin } from '../administrators.types'

interface AdminFormDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	admin?: Admin | null
	onSuccess: (result: ActionResult) => void
}

interface ActionResult {
	ok: boolean
	admin?: Admin
	id?: string
	updates?: Partial<Admin>
	intent?: string
	submission?: unknown
	error?: string
}

export function AdminFormDialog({
	open,
	onOpenChange,
	admin,
	onSuccess,
}: AdminFormDialogProps) {
	const isEditing = !!admin
	const fetcher = useFetcher<ActionResult>()
	const isSubmitting = fetcher.state !== 'idle'

	useEffect(() => {
		if (fetcher.state !== 'idle' || !fetcher.data) return
		if (fetcher.data.ok) {
			toast.success(isEditing ? 'Administrateur mis à jour' : 'Administrateur créé')
			onSuccess(fetcher.data)
			onOpenChange(false)
		}
	}, [fetcher.state, fetcher.data, isEditing, onSuccess, onOpenChange])

	const [form, fields] = useForm({
		id: `admin-form-${admin?.id ?? 'new'}`,
		constraint: getZodConstraint(adminFormSchema),
		shouldValidate: 'onBlur',
		shouldRevalidate: 'onInput',
		defaultValue: admin
			? { name: admin.name, email: admin.email, phone: admin.phone, role: admin.role }
			: { role: 'moderator' },
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: adminFormSchema })
		},
	})

	const roleControl = useInputControl(fields.role)

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const formData = new FormData(e.currentTarget)
		formData.set('intent', isEditing ? 'update' : 'create')
		if (isEditing) formData.set('id', admin.id)
		void fetcher.submit(formData, { method: 'post' })
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>
						{isEditing ? 'Modifier' : 'Ajouter'} un administrateur
					</DialogTitle>
					{!isEditing && (
						<DialogDescription>
							Créez un nouveau compte. Un email avec les identifiants sera envoyé.
						</DialogDescription>
					)}
				</DialogHeader>
				<form {...getFormProps(form)} onSubmit={handleSubmit}>
					<div className="space-y-4 py-2">
						<FieldGroup>
							<Field>
								<FieldLabel htmlFor={fields.name.id}>Nom complet</FieldLabel>
								<Input
									{...getInputProps(fields.name, { type: 'text' })}
									placeholder="Prénom Nom"
								/>
								<FieldError errors={fields.name.errors} />
							</Field>
							<Field>
								<FieldLabel htmlFor={fields.email.id}>Email</FieldLabel>
								<Input
									{...getInputProps(fields.email, { type: 'email' })}
									placeholder="admin@retrouveci.com"
								/>
								<FieldError errors={fields.email.errors} />
							</Field>
							<Field>
								<FieldLabel htmlFor={fields.phone.id}>Téléphone</FieldLabel>
								<Input
									{...getInputProps(fields.phone, { type: 'text' })}
									placeholder="+225 07 00 00 00 00"
								/>
								<FieldError errors={fields.phone.errors} />
							</Field>
							<Field>
								<FieldLabel htmlFor={fields.role.id}>Rôle</FieldLabel>
								<Select
									value={roleControl.value ?? 'moderator'}
									onValueChange={(v) => roleControl.change(v)}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="admin">Administrateur</SelectItem>
										<SelectItem value="moderator">Modérateur</SelectItem>
									</SelectContent>
								</Select>
								<input type="hidden" name="role" value={roleControl.value ?? 'moderator'} />
								<FieldError errors={fields.role.errors} />
							</Field>
						</FieldGroup>
					</div>
					<DialogFooter className="mt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isSubmitting}
						>
							Annuler
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									{isEditing ? 'Mise à jour...' : 'Création...'}
								</>
							) : isEditing ? (
								'Mettre à jour'
							) : (
								'Créer le compte'
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
