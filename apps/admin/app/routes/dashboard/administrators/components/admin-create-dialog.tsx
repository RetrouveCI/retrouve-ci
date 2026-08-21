import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	FieldGroup,
} from '@app/ui/components'
import { FormInputField, FormRootError } from '@app/ui/components/form'
import { PasswordField } from '@/components/password-field'
import { useActionFetcher } from '@/shared/hooks/use-action-fetcher'
import {
	adminCreateSchema,
	type AdminCreateData,
	type AdminCreateInput,
} from '../administrators.schema'
import { RoleSelectField } from './role-select-field'
import type { action } from '../_index'

const EMPTY_VALUES: AdminCreateInput = {
	name: '',
	email: '',
	phone: '',
	password: '',
	role: 'moderator',
}

interface AdminCreateDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function AdminCreateDialog({
	open,
	onOpenChange,
}: AdminCreateDialogProps) {
	const [hasSubmitted, setHasSubmitted] = useState(false)
	const fetcher = useActionFetcher<typeof action, AdminCreateInput>()

	const form = useForm<AdminCreateInput, unknown, AdminCreateData>({
		resolver: standardSchemaResolver(adminCreateSchema),
		mode: 'onSubmit',
		reValidateMode: 'onChange',
		defaultValues: EMPTY_VALUES,
		errors: fetcher.errors,
	})

	// The dialog stays mounted between openings, so a rejected attempt would
	// otherwise still be on screen the next time it opens.
	useEffect(() => {
		if (open) form.reset(EMPTY_VALUES)
	}, [open, form])

	useEffect(() => {
		if (!hasSubmitted || !fetcher.isOk) return

		setHasSubmitted(false)
		toast.success('Administrateur créé')
		onOpenChange(false)
	}, [hasSubmitted, fetcher.isOk, onOpenChange])

	const onSubmit = (values: AdminCreateData) => {
		setHasSubmitted(true)
		void fetcher.submit(
			{
				intent: 'create',
				name: values.name,
				email: values.email,
				phone: values.phone ?? '',
				password: values.password,
				role: values.role,
			},
			{ method: 'post' },
		)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Ajouter un administrateur</DialogTitle>
					<DialogDescription>
						Le compte sera immédiatement actif avec les identifiants fournis.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={form.handleSubmit(onSubmit)} noValidate>
					<div className="space-y-4 py-2">
						<FormRootError
							title="Impossible de créer l'administrateur"
							message={form.formState.errors.root?.message}
						/>

						<FieldGroup className="gap-4">
							<FormInputField
								control={form.control}
								name="name"
								label="Nom complet"
								placeholder="Prénom Nom"
								required
							/>
							<FormInputField
								control={form.control}
								name="email"
								label="Email"
								type="email"
								placeholder="admin@retrouveci.com"
								required
							/>
							<FormInputField
								control={form.control}
								name="phone"
								label="Téléphone (optionnel)"
								type="tel"
								inputMode="numeric"
								maxLength={14}
								placeholder="+225 07 00 00 00 00"
							/>
							<PasswordField
								control={form.control}
								name="password"
								label="Mot de passe"
								placeholder="Minimum 6 caractères"
								inputClassName="h-11"
								disabled={fetcher.isSubmitting}
							/>
							<RoleSelectField
								control={form.control}
								name="role"
								disabled={fetcher.isSubmitting}
							/>
						</FieldGroup>
					</div>

					<DialogFooter className="mt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={fetcher.isSubmitting}
						>
							Annuler
						</Button>
						<Button type="submit" disabled={fetcher.isSubmitting}>
							{fetcher.isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Création...
								</>
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
