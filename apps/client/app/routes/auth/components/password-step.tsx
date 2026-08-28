import { FieldError } from '@app/ui/components/form'
import { PasswordChecklist } from './password-checklist'
import { PasswordInput } from './password-input'

interface PasswordStepProps {
	newPassword: string
	setNewPassword: (v: string) => void
	confirmPassword: string
	setConfirmPassword: (v: string) => void
	newPasswordErrors?: string[]
	confirmPasswordErrors?: string[]
	isSubmitting: boolean
	autoFocus?: boolean
}

export function PasswordStep({
	newPassword,
	setNewPassword,
	confirmPassword,
	setConfirmPassword,
	newPasswordErrors,
	confirmPasswordErrors,
	isSubmitting,
	autoFocus = true,
}: PasswordStepProps) {
	return (
		<div className="space-y-5">
			<div className="space-y-2">
				<PasswordInput
					id="new-password"
					name="newPassword"
					label="Mot de passe"
					value={newPassword}
					onChange={setNewPassword}
					disabled={isSubmitting}
					autoFocus={autoFocus}
				/>
				<FieldError errors={newPasswordErrors} />
			</div>

			{/* The rule, shown as it is met — it replaces `PASSWORD_HINT` here, and
			    reads the same constants the schema does. */}
			<PasswordChecklist value={newPassword} />

			<div className="space-y-2">
				<PasswordInput
					id="confirm-password"
					name="confirmPassword"
					label="Confirmer le mot de passe"
					value={confirmPassword}
					onChange={setConfirmPassword}
					disabled={isSubmitting}
				/>
				<FieldError errors={confirmPasswordErrors} />
			</div>
		</div>
	)
}
