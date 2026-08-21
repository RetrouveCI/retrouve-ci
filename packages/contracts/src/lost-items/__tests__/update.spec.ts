import { describe, expect, it } from 'vitest'
import { RESOLUTION_STATUSES } from '../lost-items.const'
import { updateLostItemSchema } from '../update.schema'

const parse = (input: unknown) => updateLostItemSchema.safeParse(input)

describe('updateLostItemSchema', () => {
	it('accepts an empty update', () => {
		expect(parse({}).data).toEqual({})
	})

	it('accepts a partial update and normalises what it carries', () => {
		expect(
			parse({
				title: '  Nouveau titre  ',
				contactWhatsapp: '07 00 00 00 00',
			}).data,
		).toEqual({ title: 'Nouveau titre', contactWhatsapp: '+2250700000000' })
	})

	it.each(RESOLUTION_STATUSES)('accepts the %s resolution status', status => {
		expect(parse({ resolutionStatus: status }).data).toEqual({
			resolutionStatus: status,
		})
	})

	it('refuses an unknown resolution status, in French', () => {
		expect(parse({ resolutionStatus: 'perdu' }).error?.issues[0]?.message).toBe(
			'Statut invalide',
		)
	})

	// `type` and `category` are set at publication and stay put: the pipe strips
	// them rather than letting an update rewrite what an annonce is.
	it('strips type and category', () => {
		expect(parse({ type: 'found', category: 'keys' }).data).toEqual({})
	})

	it('keeps the create rules on every field it inherits', () => {
		expect(parse({ description: 'Trop court' }).error?.issues[0]?.message).toBe(
			'La description doit contenir au moins 20 caractères',
		)
		expect(
			parse({ photos: ['a', 'b', 'c', 'd', 'e', 'f'] }).error?.issues[0]
				?.message,
		).toBe('Vous ne pouvez pas ajouter plus de 5 photos')
		expect(parse({ eventDate: '2026-02-31' }).error?.issues[0]?.message).toBe(
			'Date invalide',
		)
	})
})
