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
} from '@app/ui/components'
import { FormRootError } from '@app/ui/components/form'
import { useActionFetcher } from '@/shared/hooks/use-action-fetcher'
import {
	adminUpdateRoleSchema,
	type AdminRoleData,
	type AdminRoleInput,
} from '../administrators.schema'
import { RoleSelectField } from './role-select-field'
import type { Admin } from '../types/administrators.types'
import type { action } from '../_index'

/** The row menu disables the entry for a super admin, so the fallback is unreachable. */
function toFormValues(admin?: Admin | null): AdminRoleInput {
	return { role: admin?.role === 'moderator' ? 'moderator' : 'admin' }
}

interface AdminRoleDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	admin?: Admin | null
}

export function AdminRoleDialog({
	open,
	onOpenChange,
	admin,
}: AdminRoleDialogProps) {
	const [hasSubmitted, setHasSubmitted] = useState(false)
	const fetcher = useActionFetcher<typeof action, AdminRoleInput>()

	const form = useForm<AdminRoleInput, unknown, AdminRoleData>({
		resolver: standardSchemaResolver(adminUpdateRoleSchema),
		mode: 'onSubmit',
		reValidateMode: 'onChange',
		defaultValues: toFormValues(admin),
		errors: fetcher.errors,
	})

	// The dialog stays mounted between openings, so `defaultValues` alone would
	// keep whichever administrator was edited first.
	useEffect(() => {
		if (open) form.reset(toFormValues(admin))
	}, [open, admin, form])

	useEffect(() => {
		if (!hasSubmitted || !fetcher.isOk) return

		setHasSubmitted(false)
		toast.success('Rôle mis à jour')
		onOpenChange(false)
	}, [hasSubmitted, fetcher.isOk, onOpenChange])

	const onSubmit = (values: AdminRoleData) => {
		if (!admin) return

		setHasSubmitted(true)
		void fetcher.submit(
			{ intent: 'update', id: admin.id, role: values.role },
			{ method: 'post' },
		)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Modifier le rôle</DialogTitle>
					<DialogDescription>
						Seul le rôle peut être modifié depuis cette interface.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={form.handleSubmit(onSubmit)} noValidate>
					<div className="space-y-4 py-2">
						<FormRootError
							title="Impossible de mettre à jour le rôle"
							message={form.formState.errors.root?.message}
						/>

						{admin && (
							<div className="bg-muted/50 rounded-lg p-3 text-sm">
								<p className="font-medium">{admin.name}</p>
								<p className="text-muted-foreground">{admin.email}</p>
							</div>
						)}

						<RoleSelectField
							control={form.control}
							name="role"
							disabled={fetcher.isSubmitting}
						/>
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
									Mise à jour...
								</>
							) : (
								'Mettre à jour'
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
