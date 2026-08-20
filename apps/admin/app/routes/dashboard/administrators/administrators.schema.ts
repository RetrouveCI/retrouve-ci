import { z } from 'zod'

/** The two roles this interface can hand out — `super_admin` is not one of them. */
export const editableRoleSchema = z.enum(['admin', 'moderator'])

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
	phone: z
		.string()
		.max(20, 'Maximum 20 caractères')
		.optional()
		.transform(value => (value === '' ? undefined : value)),
	password: z.string().min(6, 'Minimum 6 caractères'),
	role: editableRoleSchema,
})

export const adminUpdateRoleSchema = z.object({ role: editableRoleSchema })

export type EditableRole = z.output<typeof editableRoleSchema>

export type AdminCreateInput = z.input<typeof adminCreateSchema>
export type AdminCreateData = z.output<typeof adminCreateSchema>

export type AdminRoleInput = z.input<typeof adminUpdateRoleSchema>
export type AdminRoleData = z.output<typeof adminUpdateRoleSchema>
