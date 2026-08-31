import { buildContactMessage, buildWhatsAppContactUrl } from '../contact-links'

const MESSAGE = 'Bonjour'

describe('buildWhatsAppContactUrl', () => {
	it.each([
		['E.164, as the contract now stores it', '+2250700000000'],
		['a bare local number, as older rows hold', '0700000000'],
		['a spaced local number', '07 00 00 00 00'],
	])('addresses 2250700000000 from %s', (_shape, phone) => {
		expect(buildWhatsAppContactUrl(phone, MESSAGE)).toBe(
			'https://wa.me/2250700000000?text=Bonjour',
		)
	})

	it('percent-encodes the message, which carries accents and quotes', () => {
		const url = buildWhatsAppContactUrl('0700000000', 'peut-être « Téléphone »')

		expect(url).toBe(
			'https://wa.me/2250700000000?text=peut-%C3%AAtre%20%C2%AB%20T%C3%A9l%C3%A9phone%20%C2%BB',
		)
	})

	// The double-prefixed number CLAUDE.md records as stored in production: ten
	// digits is the only length `wa.me` can be given honestly.
	it.each([
		['double-prefixed', '+2252250700000000'],
		['too short', '070000'],
		['empty', ''],
	])('refuses a %s number rather than dialling it', (_shape, phone) => {
		expect(buildWhatsAppContactUrl(phone, MESSAGE)).toBeNull()
	})
})

describe('buildContactMessage', () => {
	it('writes as the finder when the object was lost', () => {
		expect(buildContactMessage('Tecno Spark', 'lost')).toContain(
			"j'ai peut-être trouvé votre objet",
		)
	})

	it('writes as the owner when the object was found', () => {
		expect(buildContactMessage('Tecno Spark', 'found')).toContain(
			'est peut-être le mien',
		)
	})

	it('names the listing, which is what identifies it for the recipient', () => {
		expect(buildContactMessage('Tecno Spark', 'lost')).toContain(
			'« Tecno Spark »',
		)
	})
})
