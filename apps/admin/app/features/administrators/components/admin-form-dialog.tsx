import { useEffect, useRef } from 'react'
import { useFetcher } from 'react-router'
import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@retrouve-ci/ui/components'
import {
	InputField,
	InputLabel,
	FieldError,
} from '@retrouve-ci/ui/components/form'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
	useForm,
	useInputControl,
	getFormProps,
	type Submission,
} from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { type z } from 'zod'
import {
	adminCreateSchema,
	adminUpdateRoleSchema,
} from '../administrators.schema'
import type { Admin } from '../administrators.types'

type CreateSchema = z.infer<typeof adminCreateSchema>

interface AdminFormDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	admin?: Admin | null
	onSuccess: () => void
}

interface ActionResult {
	ok: boolean
	intent?: string
	error?: string
	submission?: unknown
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

	const [form, fields] = useForm<CreateSchema>({
		id: `admin-form-${admin?.id ?? 'new'}`,
		constraint: getZodConstraint(adminCreateSchema),
		shouldValidate: 'onSubmit',
		shouldRevalidate: 'onBlur',
		defaultValue: admin ? { role: admin.role } : { role: 'moderator' },
		onValidate({ formData }) {
			if (isEditing) {
				return parseWithZod(formData, {
					schema: adminUpdateRoleSchema,
				}) as unknown as Submission<CreateSchema>
			}

			return parseWithZod(formData, { schema: adminCreateSchema })
		},
		onSubmit(event, { submission, formData }) {
			event.preventDefault()
			if (submission?.status !== 'success') return
			formData.set('intent', isEditing ? 'update' : 'create')
			if (admin) formData.set('id', admin.id)
			void fetcher.submit(formData, { method: 'post' })
		},
	})

	const roleControl = useInputControl(fields.role)
	const processedRef = useRef<ActionResult | undefined>(undefined)

	useEffect(() => {
		if (fetcher.state !== 'idle' || !fetcher.data) return
		if (fetcher.data === processedRef.current) return
		processedRef.current = fetcher.data

		if (fetcher.data.ok) {
			toast.success(isEditing ? 'Rôle mis à jour' : 'Administrateur créé')
			onSuccess()
			onOpenChange(false)
		} else if (fetcher.data.error) {
			toast.error(fetcher.data.error)
		}
	}, [fetcher.state, fetcher.data, isEditing, onSuccess, onOpenChange])

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>
						{isEditing ? 'Modifier le rôle' : 'Ajouter un administrateur'}
					</DialogTitle>
					{isEditing ? (
						<DialogDescription>
							Seul le rôle peut être modifié depuis cette interface.
						</DialogDescription>
					) : (
						<DialogDescription>
							Le compte sera immédiatement actif avec les identifiants fournis.
						</DialogDescription>
					)}
				</DialogHeader>
				<form {...getFormProps(form)}>
					<div className="space-y-4 py-2">
						{isEditing ? (
							<div className="bg-muted/50 rounded-lg p-3 text-sm">
								<p className="font-medium">{admin.name}</p>
								<p className="text-muted-foreground">{admin.email}</p>
							</div>
						) : (
							<div className="space-y-4">
								<InputField
									field={fields.name}
									label="Nom complet"
									placeholder="Prénom Nom"
								/>
								<InputField
									field={fields.email}
									label="Email"
									type="email"
									placeholder="admin@retrouveci.com"
								/>
								<InputField
									field={fields.phone}
									label="Téléphone (optionnel)"
									placeholder="+225 07 00 00 00 00"
								/>
								<InputField
									field={fields.password}
									label="Mot de passe"
									type="password"
									placeholder="Minimum 6 caractères"
								/>
							</div>
						)}
						<div className="space-y-2">
							<InputLabel htmlFor={fields.role.id}>Rôle</InputLabel>
							<Select
								value={roleControl.value ?? 'moderator'}
								onValueChange={v => roleControl.change(v)}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="admin">Administrateur</SelectItem>
									<SelectItem value="moderator">Modérateur</SelectItem>
								</SelectContent>
							</Select>
							<input
								type="hidden"
								name="role"
								value={roleControl.value ?? 'moderator'}
							/>
							<FieldError errors={fields.role.errors} />
						</div>
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
