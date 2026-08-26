import { z } from 'zod'
import { passwordSchema } from '@app/contracts/shared'
import { isValidLocalNumber, PHONE_ERROR_MESSAGE } from '@/shared/utils/phone'

/**
 * The two roles this interface can hand out — `super_admin` is not one of them.
 * A bare `z.enum` reports its refusal in English, and this one is rendered on
 * the `role` field of both the create form and the role dialog.
 */
export const editableRoleSchema = z.enum(['admin', 'moderator'], {
	error: 'Rôle invalide',
})

export const adminCreateSchema = z.object({
	name: z
		.string()
		.min(2, 'Minimum 2 caractères')
		.max(80, 'Maximum 80 caractères'),
	email: z.email({
		error: issue => (issue.input ? 'Email invalide' : "L'email est requis"),
	}),
	// The input is an empty string when the field is left blank; the API wants the
	// key absent rather than empty, so the transform is what `z.output` carries.
	// Blank stays allowed — the field is optional — but anything typed must be a
	// real number, since it shares a column with the public app's OTP recipient.
	phone: z
		.string()
		.refine(
			value => value === '' || isValidLocalNumber(value),
			PHONE_ERROR_MESSAGE,
		)
		.optional()
		.transform(value => (value === '' ? undefined : value)),
	password: passwordSchema,
	role: editableRoleSchema,
})

export const adminUpdateRoleSchema = z.object({ role: editableRoleSchema })

export type EditableRole = z.output<typeof editableRoleSchema>

export type AdminCreateInput = z.input<typeof adminCreateSchema>
export type AdminCreateData = z.output<typeof adminCreateSchema>

export type AdminRoleInput = z.input<typeof adminUpdateRoleSchema>
export type AdminRoleData = z.output<typeof adminUpdateRoleSchema>
