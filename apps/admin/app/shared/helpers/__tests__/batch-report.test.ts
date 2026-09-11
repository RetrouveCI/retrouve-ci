import { batchMessage, batchSucceeded, isBatchOutcome } from '../batch-report'

const noun = { one: 'annonce publiée', many: 'annonces publiées' }

describe('batchMessage', () => {
	it('counts what went through', () => {
		expect(batchMessage({ succeeded: ['a', 'b'], failed: [] }, noun)).toBe(
			'2 annonces publiées',
		)
	})

	it('agrees in the singular', () => {
		expect(batchMessage({ succeeded: ['a'], failed: [] }, noun)).toBe(
			'1 annonce publiée',
		)
	})

	// A « 3 sur 8 » that says nothing of the five leaves the operator guessing.
	it('names what went wrong beside what went through', () => {
		expect(
			batchMessage(
				{
					succeeded: ['a'],
					failed: [{ id: 'b', reason: 'Annonce introuvable' }],
				},
				noun,
			),
		).toBe('1 annonce publiée · 1 en échec — Annonce introuvable')
	})

	// Twenty rows failing for one reason is one thing to read, not twenty.
	it('says a shared reason once', () => {
		const failed = ['b', 'c', 'd'].map(id => ({
			id,
			reason: 'Annonce introuvable',
		}))

		expect(batchMessage({ succeeded: ['a'], failed }, noun)).toBe(
			'1 annonce publiée · 3 en échec — Annonce introuvable',
		)
	})

	it('names every distinct reason', () => {
		const message = batchMessage(
			{
				succeeded: [],
				failed: [
					{ id: 'a', reason: 'Annonce introuvable' },
					{ id: 'b', reason: 'Erreur inconnue' },
				],
			},
			noun,
		)

		expect(message).toBe(
			'Aucune action effectuée — Annonce introuvable · Erreur inconnue',
		)
	})

	// `formatNumber` groups with a narrow no-break space, so match on the shape.
	it('groups a large count the French way', () => {
		const succeeded = Array.from({ length: 1284 }, (_, i) => `id-${i}`)

		expect(batchMessage({ succeeded, failed: [] }, noun)).toMatch(
			/^1\s284 annonces publiées$/,
		)
	})
})

describe('batchSucceeded', () => {
	it.each([
		[{ succeeded: ['a'], failed: [] }, true],
		[{ succeeded: ['a'], failed: [{ id: 'b', reason: 'x' }] }, false],
		[{ succeeded: [], failed: [{ id: 'b', reason: 'x' }] }, false],
		[{ succeeded: [], failed: [] }, false],
	])('reads %j as %s', (outcome, expected) => {
		expect(batchSucceeded(outcome)).toBe(expected)
	})
})

describe('isBatchOutcome', () => {
	it('recognises a batch answer', () => {
		expect(isBatchOutcome({ succeeded: [], failed: [] })).toBe(true)
	})

	// The other half of the union: one row of the page it was posted from.
	it.each([
		{ id: 'post-1', title: 'iPhone perdu' },
		{ id: 'order-1', succeeded: 'oui' },
		null,
		undefined,
		'succeeded',
	])('reads %j as a row, not a batch', data => {
		expect(isBatchOutcome(data)).toBe(false)
	})
})
