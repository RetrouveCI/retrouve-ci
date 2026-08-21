import { z } from 'zod'
import { passwordSchema, withPasswordConfirmation } from '@app/contracts/shared'

export const resetPasswordSchema = withPasswordConfirmation(
	z.object({
		token: z.string().min(1, 'Lien de réinitialisation invalide ou expiré'),
		newPassword: passwordSchema,
		confirmPassword: z.string(),
	}),
)

export type ResetPasswordInput = z.input<typeof resetPasswordSchema>
export type ResetPasswordData = z.output<typeof resetPasswordSchema>
