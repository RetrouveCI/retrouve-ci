'use client'

import { Button } from '@retrouve-ci/ui/components'
import { Loader2 } from 'lucide-react'
import { PasswordInput } from './PasswordInput'

type PasswordStepMode = 'create-password' | 'new-password'

interface PasswordStepProps {
	step: PasswordStepMode
	newPassword: string
	setNewPassword: (v: string) => void
	confirmPassword: string
	setConfirmPassword: (v: string) => void
	confirmError: string
	setConfirmError: (v: string) => void
	isSubmitting: boolean
	onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}

export function PasswordStep({
	step,
	newPassword,
	setNewPassword,
	confirmPassword,
	setConfirmPassword,
	confirmError,
	setConfirmError,
	isSubmitting,
	onSubmit,
}: PasswordStepProps) {
	const isCreate = step === 'create-password'

	return (
		<form onSubmit={onSubmit} className="space-y-6">
			<PasswordInput
				id="new-password"
				label={isCreate ? 'Choisir un mot de passe' : 'Nouveau mot de passe'}
				value={newPassword}
				onChange={v => {
					setNewPassword(v)
					setConfirmError('')
				}}
				placeholder="Minimum 6 caracteres"
				hint="Au moins 6 caracteres."
				disabled={isSubmitting}
				autoFocus
			/>
			<PasswordInput
				id="confirm-password"
				label={
					isCreate
						? 'Confirmer le mot de passe'
						: 'Confirmer le nouveau mot de passe'
				}
				value={confirmPassword}
				onChange={v => {
					setConfirmPassword(v)
					setConfirmError('')
				}}
				disabled={isSubmitting}
			/>
			{confirmError && (
				<p className="text-destructive text-sm">{confirmError}</p>
			)}

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
		</form>
	)
}
