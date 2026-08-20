import {
	adminCreateSchema,
	adminUpdateRoleSchema,
} from '../administrators.schema'

const VALID = {
	name: 'Awa Koné',
	email: 'awa@retrouveci.com',
	phone: '+225 07 00 00 00 00',
	password: 'motdepasse',
	role: 'moderator',
}

describe('adminCreateSchema', () => {
	it('accepts a complete payload and keeps the phone number', () => {
		const result = adminCreateSchema.safeParse(VALID)

		expect(result.success).toBe(true)
		expect(result.data).toEqual({
			name: 'Awa Koné',
			email: 'awa@retrouveci.com',
			phone: '+225 07 00 00 00 00',
			password: 'motdepasse',
			role: 'moderator',
		})
	})

	it('turns the blank the form sends for an untouched phone into no value at all', () => {
		const result = adminCreateSchema.safeParse({ ...VALID, phone: '' })

		expect(result.success).toBe(true)
		expect(result.data?.phone).toBeUndefined()
	})

	it('accepts a payload with no phone key', () => {
		const { phone: _phone, ...withoutPhone } = VALID
		const result = adminCreateSchema.safeParse(withoutPhone)

		expect(result.success).toBe(true)
		expect(result.data?.phone).toBeUndefined()
	})

	it('rejects a phone number over 20 characters', () => {
		const result = adminCreateSchema.safeParse({
			...VALID,
			phone: '0'.repeat(21),
		})

		expect(result.error?.issues[0]?.message).toBe('Maximum 20 caractères')
	})

	it('reports a name shorter than two characters', () => {
		const result = adminCreateSchema.safeParse({ ...VALID, name: 'A' })

		expect(result.error?.issues[0]?.message).toBe('Minimum 2 caractères')
	})

	it('tells a blank email apart from a malformed one', () => {
		expect(
			adminCreateSchema.safeParse({ ...VALID, email: '' }).error?.issues[0]
				?.message,
		).toBe("L'email est requis")
		expect(
			adminCreateSchema.safeParse({ ...VALID, email: 'pas-un-email' }).error
				?.issues[0]?.message,
		).toBe('Email invalide')
	})

	it('reports a password shorter than six characters', () => {
		const result = adminCreateSchema.safeParse({ ...VALID, password: 'court' })

		expect(result.error?.issues[0]?.message).toBe('Minimum 6 caractères')
	})

	it('refuses a role this interface cannot hand out', () => {
		expect(
			adminCreateSchema.safeParse({ ...VALID, role: 'super_admin' }).success,
		).toBe(false)
		expect(
			adminCreateSchema.safeParse({ ...VALID, role: 'user' }).success,
		).toBe(false)
	})
})

describe('adminUpdateRoleSchema', () => {
	it('accepts the two editable roles', () => {
		expect(adminUpdateRoleSchema.safeParse({ role: 'admin' }).success).toBe(
			true,
		)
		expect(adminUpdateRoleSchema.safeParse({ role: 'moderator' }).success).toBe(
			true,
		)
	})

	it('rejects a missing role and a role it cannot hand out', () => {
		expect(adminUpdateRoleSchema.safeParse({}).success).toBe(false)
		expect(
			adminUpdateRoleSchema.safeParse({ role: 'super_admin' }).success,
		).toBe(false)
	})
})
