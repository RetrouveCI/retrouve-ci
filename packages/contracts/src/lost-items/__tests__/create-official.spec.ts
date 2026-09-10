import { describe, expect, it } from 'vitest'
import { NAME_MAX_LENGTH } from '../../shared/name'
import { createLostItemSchema } from '../create.schema'
import { createOfficialLostItemSchema } from '../create-official.schema'

const base = {
	type: 'found',
	category: 'documents',
	title: "Carte nationale d'identité au nom de Konan Aya",
	description: 'Déposée au bureau par un chauffeur de taxi communal.',
	ville: 'Abidjan',
	commune: 'Cocody',
	eventDate: '2026-09-06',
	contactName: 'Équipe RetrouveCI',
	contactWhatsapp: '0758412209',
	documentType: 'national_id',
	documentHolderName: 'Konan Aya',
}

describe('createOfficialLostItemSchema', () => {
	it('accepts the same listing the public form posts', () => {
		expect(createOfficialLostItemSchema.safeParse(base).success).toBe(true)
	})

	it('accepts an optional postedFor', () => {
		const parsed = createOfficialLostItemSchema.parse({
			...base,
			postedFor: '  Koffi Yao  ',
		})

		expect(parsed.postedFor).toBe('Koffi Yao')
	})

	it('leaves postedFor undefined when it is not given', () => {
		expect(createOfficialLostItemSchema.parse(base).postedFor).toBeUndefined()
	})

	it('refuses a postedFor longer than a name', () => {
		const result = createOfficialLostItemSchema.safeParse({
			...base,
			postedFor: 'a'.repeat(NAME_MAX_LENGTH + 1),
		})

		expect(result.success).toBe(false)
		expect(result.error?.issues[0]?.message).toBe('Ce nom est trop long')
	})

	/**
	 * A code is resolved against its owner's own tokens, and a system account
	 * holds none — so the field is not offered, and the pipe strips an attempt.
	 */
	it('does not carry a stickerCode, where the public schema does', () => {
		const parsed = createOfficialLostItemSchema.parse({
			...base,
			stickerCode: 'RCI-4K7P2M',
		})

		expect(parsed).not.toHaveProperty('stickerCode')
		expect(
			createLostItemSchema.parse({ ...base, stickerCode: 'RCI-4K7P2M' })
				.stickerCode,
		).toBe('RCI-4K7P2M')
	})

	// The same normalisation the public form gets: the number is turned into
	// E.164 once, server-side.
	it('normalises the contact number like the public schema', () => {
		expect(createOfficialLostItemSchema.parse(base).contactWhatsapp).toBe(
			'+2250758412209',
		)
	})

	// It carries no exemption from the document rules: a piece of ID still needs
	// its holder named.
	it('still requires a holder name for a piece of ID', () => {
		const result = createOfficialLostItemSchema.safeParse({
			...base,
			documentHolderName: undefined,
		})

		expect(result.success).toBe(false)
	})
})
