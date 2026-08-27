import { z } from 'zod'
import { passwordSchema, withPasswordConfirmation } from '@app/contracts/shared'

export const changePasswordSchema = withPasswordConfirmation(
	z.object({
		currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
		newPassword: passwordSchema,
		confirmPassword: z.string().min(1, 'Confirmation requise'),
	}),
)

export type ChangePasswordInput = z.input<typeof changePasswordSchema>
export type ChangePasswordData = z.output<typeof changePasswordSchema>
