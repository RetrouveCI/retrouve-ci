import { Button } from '@retrouve-ci/ui/components'
import { FieldError } from '@retrouve-ci/ui/components/form'
import { Loader2 } from 'lucide-react'
import { PasswordInput } from './password-input'

type PasswordStepMode = 'create-password' | 'new-password'

interface PasswordStepProps {
	step: PasswordStepMode
	newPassword: string
	setNewPassword: (v: string) => void
	confirmPassword: string
	setConfirmPassword: (v: string) => void
	newPasswordErrors?: string[]
	confirmPasswordErrors?: string[]
	isSubmitting: boolean
}

export function PasswordStep({
	step,
	newPassword,
	setNewPassword,
	confirmPassword,
	setConfirmPassword,
	newPasswordErrors,
	confirmPasswordErrors,
	isSubmitting,
}: PasswordStepProps) {
	const isCreate = step === 'create-password'

	return (
		<div className="space-y-6">
			<PasswordInput
				id="new-password"
				name="newPassword"
				label={isCreate ? 'Choisir un mot de passe' : 'Nouveau mot de passe'}
				value={newPassword}
				onChange={setNewPassword}
				placeholder="Minimum 6 caracteres"
				hint="Au moins 6 caracteres."
				disabled={isSubmitting}
				autoFocus
			/>
			<FieldError errors={newPasswordErrors} />
			<PasswordInput
				id="confirm-password"
				name="confirmPassword"
				label={
					isCreate
						? 'Confirmer le mot de passe'
						: 'Confirmer le nouveau mot de passe'
				}
				value={confirmPassword}
				onChange={setConfirmPassword}
				disabled={isSubmitting}
			/>
			<FieldError errors={confirmPasswordErrors} />

			<Button
				type="submit"
				className="bg-primary-green hover:bg-primary-green-dark h-12 w-full rounded-xl text-base font-semibold text-white transition-all hover:scale-[1.02]"
				disabled={isSubmitting || newPassword.length < 6}
			>
				{isSubmitting ? (
					<>
						<Loader2 className="h-4 w-4 animate-spin" />{' '}
						{isCreate ? 'Creation du compte...' : 'Reinitialisation...'}
					</>
				) : isCreate ? (
					'Creer mon compte'
				) : (
					'Reinitialiser le mot de passe'
				)}
			</Button>
		</div>
	)
}
