import { z } from 'zod'
import { zodErrorToFieldErrors } from '../form'

const schema = z
	.object({
		email: z.string().email('Adresse e-mail invalide.'),
		password: z.string().min(8, 'Au moins 8 caractères.'),
		confirmPassword: z.string(),
	})
	.refine(values => values.password === values.confirmPassword, {
		message: 'Les mots de passe ne correspondent pas.',
		path: ['confirmPassword'],
	})

function errorFor(input: unknown) {
	const result = schema.safeParse(input)
	if (result.success) throw new Error('expected the schema to reject the input')
	return result.error
}

describe('zodErrorToFieldErrors', () => {
	it('maps each failing field to a react-hook-form error entry', () => {
		const errors = zodErrorToFieldErrors(
			errorFor({ email: 'nope', password: 'short', confirmPassword: 'short' }),
		)

		expect(errors).toEqual({
			email: { type: 'custom', message: 'Adresse e-mail invalide.' },
			password: { type: 'custom', message: 'Au moins 8 caractères.' },
		})
	})

	it('keeps only the first message of a field with several issues', () => {
		const multiIssue = z.object({
			username: z
				.string()
				.min(3, 'Au moins 3 caractères.')
				.regex(/^[a-z]+$/, 'Lettres minuscules uniquement.'),
		})
		const result = multiIssue.safeParse({ username: '1' })
		if (result.success) throw new Error('expected the schema to reject')

		expect(zodErrorToFieldErrors(result.error)).toEqual({
			username: { type: 'custom', message: 'Au moins 3 caractères.' },
		})
	})

	it('routes an issue targeting a field to that field, not to root', () => {
		const errors = zodErrorToFieldErrors(
			errorFor({
				email: 'admin@retrouve.ci',
				password: 'motdepasse',
				confirmPassword: 'autrechose',
			}),
		)

		expect(errors).toEqual({
			confirmPassword: {
				type: 'custom',
				message: 'Les mots de passe ne correspondent pas.',
			},
		})
	})

	it('puts an issue that belongs to no field on root', () => {
		const formLevel = z
			.object({ from: z.number(), to: z.number() })
			.refine(values => values.from <= values.to, {
				message: 'La période est invalide.',
			})
		const result = formLevel.safeParse({ from: 2, to: 1 })
		if (result.success) throw new Error('expected the schema to reject')

		expect(zodErrorToFieldErrors(result.error)).toEqual({
			root: { type: 'custom', message: 'La période est invalide.' },
		})
	})

	it('returns undefined when the error carries no issue', () => {
		expect(zodErrorToFieldErrors(new z.ZodError([]))).toBeUndefined()
	})
})
