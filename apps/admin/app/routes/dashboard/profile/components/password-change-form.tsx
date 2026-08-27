import { useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { PASSWORD_HINT } from '@app/contracts/shared'
import { Loader2, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { Button, FieldGroup } from '@app/ui/components'
import { FormRootError } from '@app/ui/components/form'
import { BentoCard } from '@/components/bento-card'
import { PasswordField } from '@/components/password-field'
import {
	changePasswordSchema,
	type ChangePasswordData,
	type ChangePasswordInput,
} from '../profile.schema'
import { usePasswordChangeSubmit } from '../hooks/use-password-change-submit'

export function PasswordChangeForm() {
	const { submit, isSubmitting, errors } = usePasswordChangeSubmit()

	const form = useForm<ChangePasswordInput, unknown, ChangePasswordData>({
		resolver: standardSchemaResolver(changePasswordSchema),
		mode: 'onSubmit',
		reValidateMode: 'onChange',
		defaultValues: {
			currentPassword: '',
			newPassword: '',
			confirmPassword: '',
		},
		errors,
	})

	const onSubmit = async (values: ChangePasswordData) => {
		if (await submit(values)) {
			toast.success('Mot de passe mis à jour avec succès')
			form.reset()
		}
	}

	return (
		<BentoCard variant="content" className="lg:col-span-2">
			<div className="p-6">
				<div className="mb-4 flex items-center gap-2">
					<Lock className="text-primary h-5 w-5" />
					<h4 className="text-lg font-semibold">Changer le mot de passe</h4>
				</div>
				<p className="text-muted-foreground mb-5 text-sm">
					Mettez à jour votre mot de passe pour sécuriser votre compte.
				</p>

				<form
					onSubmit={form.handleSubmit(onSubmit)}
					noValidate
					className="max-w-md"
				>
					<FormRootError
						title="Impossible de changer le mot de passe"
						message={form.formState.errors.root?.message}
						className="mb-4"
					/>

					<FieldGroup className="gap-4">
						<PasswordField
							control={form.control}
							name="currentPassword"
							label="Mot de passe actuel"
							autoComplete="current-password"
							disabled={isSubmitting}
						/>

						<PasswordField
							control={form.control}
							name="newPassword"
							label="Nouveau mot de passe"
							hint={PASSWORD_HINT}
							disabled={isSubmitting}
						/>

						<PasswordField
							control={form.control}
							name="confirmPassword"
							label="Confirmer le mot de passe"
							disabled={isSubmitting}
						/>
					</FieldGroup>

					<Button type="submit" className="mt-6" disabled={isSubmitting}>
						{isSubmitting ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Mise à jour...
							</>
						) : (
							'Mettre à jour le mot de passe'
						)}
					</Button>
				</form>
			</div>
		</BentoCard>
	)
}
