import {
	adminCreateSchema,
	adminUpdateRoleSchema,
} from '../administrators.schema'

const VALID = {
	name: 'Awa Koné',
	email: 'awa@retrouveci.com',
	phone: '+225 07 00 00 00 00',
	password: 'Motdepasse1',
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
			password: 'Motdepasse1',
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

	// Blank stays allowed, but a number that is typed must be a real one: it
	// lands in the same column the public app sends OTPs to.
	it.each([
		['too short', '058574334'],
		['too long', '05857433421'],
		['letters', 'pas un numero'],
	])('rejects a phone number that is %s', (_label, phone) => {
		const result = adminCreateSchema.safeParse({ ...VALID, phone })

		expect(result.error?.issues[0]?.message).toBe(
			'Entrez un numéro à 10 chiffres',
		)
	})

	it.each(['0585743342', '05 85 74 33 42', '+2250585743342'])(
		'accepts %s',
		phone => {
			expect(adminCreateSchema.safeParse({ ...VALID, phone }).success).toBe(
				true,
			)
		},
	)

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

	// This form used to allow six characters and no complexity, so an admin
	// created here could not reset their own password afterwards.
	it.each(['court', 'motdepasse', 'MOTDEPASSE1', 'Motdepasse'])(
		'refuses %s, which the shared rule governs',
		password => {
			expect(adminCreateSchema.safeParse({ ...VALID, password }).success).toBe(
				false,
			)
		},
	)

	it('reports the shared rule in French', () => {
		const result = adminCreateSchema.safeParse({ ...VALID, password: 'court' })

		expect(result.error?.issues[0]?.message).toBe('Au moins 8 caractères')
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
