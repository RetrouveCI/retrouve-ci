import { DOCUMENT_TYPES } from '@app/contracts/lost-items'
import { DOCUMENT_FIELDS } from '@/shared/constants/documents'
import { DOCUMENT_GUIDE, DOCUMENT_GUIDE_ORDER } from '../document-guide.const'

describe('the guide entry for each piece', () => {
	it('walks the contract, so no type is skipped', () => {
		expect(DOCUMENT_GUIDE_ORDER).toEqual(DOCUMENT_TYPES)
	})

	// The one axis this page differentiates on, and it belongs to the form, not
	// to prose: the two tables would otherwise disagree on who reissues a piece.
	it.each(DOCUMENT_TYPES)('agrees with the form on who issues the %s', type => {
		expect(DOCUMENT_GUIDE[type].stateIssued).toBe(
			DOCUMENT_FIELDS[type].issuer === undefined,
		)
	})

	it.each(DOCUMENT_TYPES)('says what a %s listing carries', type => {
		expect(DOCUMENT_GUIDE[type].listing.length).toBeGreaterThan(40)
	})

	it('asks for a first move only where one exists', () => {
		const withFirst = DOCUMENT_TYPES.filter(type => DOCUMENT_GUIDE[type].first)

		expect(withFirst).toEqual(['bank_card'])
	})
})

// ⚠️ R49's rule, and it holds here twice over: nothing in this repo can verify
// a fee, a delay or the papers an office asks for.
describe('what this page must never claim', () => {
	const prose = DOCUMENT_TYPES.flatMap(type => [
		DOCUMENT_GUIDE[type].listing,
		DOCUMENT_GUIDE[type].first ?? '',
	])

	it.each(prose.filter(Boolean))('invents no figure in %s', sentence => {
		expect(sentence).not.toMatch(/\d+\s*(?:F|FCFA|franc|jour|euro|semaine)/i)
	})

	it('never tells anyone to publish a full card number', () => {
		expect(DOCUMENT_GUIDE.bank_card.listing).toMatch(/derniers chiffres/)
		expect(DOCUMENT_GUIDE.bank_card.listing).toMatch(/refusé|jamais/)
	})
})
