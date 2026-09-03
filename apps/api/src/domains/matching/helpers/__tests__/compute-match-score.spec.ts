import { describe, expect, it } from 'vitest'
import { buildLostItem } from '@/domains/lost-items/__tests__/lost-item.fixture'
import {
	MATCH_SCORE_THRESHOLD,
	SCORE_EVENT_DATE_CLOSE,
	SCORE_EVENT_DATE_NEAR,
	SCORE_SAME_CATEGORY,
	SCORE_SAME_COMMUNE,
	SCORE_SAME_DOCUMENT_NUMBER,
	SCORE_SAME_DOCUMENT_TYPE,
	SCORE_SAME_HOLDER_NAME,
	SCORE_SAME_VILLE,
	SCORE_TEXT_OVERLAP,
} from '../../constants'
import { computeMatchScore } from '../compute-match-score'

describe('computeMatchScore', () => {
	it('returns 0 when nothing matches', () => {
		const source = buildLostItem()
		const candidate = buildLostItem({
			id: 'lost-item-2',
			category: 'keys',
			ville: 'Bouaké',
			commune: 'Houphouet',
			title: 'Trousseau de clés trouvé',
			description: 'Trouvé sur un parking, aucune description en commun',
			eventDate: new Date('2026-05-01'),
		})

		expect(computeMatchScore(source, candidate)).toBe(0)
	})

	it('scores same category, ville, commune and close date', () => {
		const source = buildLostItem()
		const candidate = buildLostItem({
			id: 'lost-item-2',
			type: 'found',
			title: 'Téléphone retrouvé',
			description: 'Trouvé sans rapport avec le texte source',
			eventDate: new Date('2026-01-03'),
		})

		expect(computeMatchScore(source, candidate)).toBe(
			SCORE_SAME_CATEGORY +
				SCORE_SAME_VILLE +
				SCORE_SAME_COMMUNE +
				SCORE_EVENT_DATE_CLOSE,
		)
	})

	it('scores a near (but not close) event date lower', () => {
		const source = buildLostItem()
		const candidate = buildLostItem({
			id: 'lost-item-2',
			type: 'found',
			category: 'keys',
			ville: 'Bouaké',
			commune: 'Houphouet',
			title: 'Trousseau de clés trouvé',
			description: 'Trouvé sur un parking, aucune description en commun',
			eventDate: new Date('2026-01-20'),
		})

		expect(computeMatchScore(source, candidate)).toBe(SCORE_EVENT_DATE_NEAR)
	})

	it('scores text overlap between title and description', () => {
		const source = buildLostItem({
			title: 'iPhone 13 perdu',
			description:
				'Perdu près du marché de Cocody, coque noire avec autocollant',
		})
		const candidate = buildLostItem({
			id: 'lost-item-2',
			type: 'found',
			category: 'keys',
			ville: 'Bouaké',
			commune: 'Houphouet',
			title: 'Coque noire trouvée',
			description: 'Trouvée près du marché, aucun autre détail',
			eventDate: new Date('2026-05-01'),
		})

		expect(computeMatchScore(source, candidate)).toBe(SCORE_TEXT_OVERLAP)
	})

	it('is case-insensitive for ville and commune', () => {
		const source = buildLostItem({ ville: 'Abidjan', commune: 'Cocody' })
		const candidate = buildLostItem({
			id: 'lost-item-2',
			type: 'found',
			category: 'keys',
			ville: 'ABIDJAN',
			commune: 'COCODY',
			title: 'Trousseau de clés trouvé',
			description: 'Trouvé sur un parking, aucune description en commun',
			eventDate: new Date('2026-05-01'),
		})

		expect(computeMatchScore(source, candidate)).toBe(
			SCORE_SAME_VILLE + SCORE_SAME_COMMUNE,
		)
	})

	describe('a piece of ID', () => {
		const buildDocument = (overrides = {}) =>
			buildLostItem({
				category: 'documents',
				title: 'Papiers perdus',
				description: 'Perdus quelque part, aucun detail en commun',
				eventDate: new Date('2026-05-01'),
				...overrides,
			})

		// Same category, town, commune and day, and one word in common.
		const baseline =
			SCORE_SAME_CATEGORY +
			SCORE_SAME_VILLE +
			SCORE_SAME_COMMUNE +
			SCORE_EVENT_DATE_CLOSE +
			SCORE_TEXT_OVERLAP

		it('leaves a listing that names no holder exactly where it was', () => {
			const source = buildDocument()
			const candidate = buildDocument({ id: 'lost-item-2', type: 'found' })

			expect(computeMatchScore(source, candidate)).toBe(baseline)
		})

		it('adds the holder and the type when both sides agree', () => {
			const source = buildDocument({
				documentType: 'national_id',
				documentHolderName: 'KOUASSI Jean',
			})
			const candidate = buildDocument({
				id: 'lost-item-2',
				type: 'found',
				documentType: 'national_id',
				documentHolderName: 'jean kouassi',
			})

			expect(computeMatchScore(source, candidate)).toBe(
				baseline + SCORE_SAME_HOLDER_NAME + SCORE_SAME_DOCUMENT_TYPE,
			)
		})

		/** Otherwise two strangers' cards in Abidjan notify each other. */
		it('disqualifies a pair whose two holders share nothing', () => {
			const source = buildDocument({
				documentType: 'national_id',
				documentHolderName: 'KOUASSI Jean',
			})
			const candidate = buildDocument({
				id: 'lost-item-2',
				type: 'found',
				documentType: 'national_id',
				documentHolderName: 'TRAORE Fatou',
			})

			expect(baseline).toBeGreaterThanOrEqual(MATCH_SCORE_THRESHOLD)
			expect(computeMatchScore(source, candidate)).toBe(0)
		})

		/** The same number is not a probable pair: it is the same document. */
		it('clears the threshold on the number alone', () => {
			const source = buildDocument({
				category: 'wallet',
				ville: 'Abidjan',
				commune: 'Cocody',
				documentType: 'driver_licence',
				documentNumber: '5811403-13-0015703713RC',
			})
			const candidate = buildDocument({
				id: 'lost-item-2',
				type: 'found',
				category: 'documents',
				ville: 'Bouaké',
				commune: 'Belleville',
				title: 'Permis retrouve',
				description: 'Remis au poste, sans autre indication utile',
				eventDate: new Date('2025-01-01'),
				documentType: 'national_id',
				documentNumber: '581140313 0015703713 RC',
			})

			expect(computeMatchScore(source, candidate)).toBe(
				SCORE_SAME_DOCUMENT_NUMBER,
			)
			expect(SCORE_SAME_DOCUMENT_NUMBER).toBeGreaterThanOrEqual(
				MATCH_SCORE_THRESHOLD,
			)
		})

		it('lets an agreeing number outweigh a name that was mistyped', () => {
			const source = buildDocument({
				documentType: 'national_id',
				documentHolderName: 'KOUASSI Jean',
				documentNumber: 'CI0012345678',
			})
			const candidate = buildDocument({
				id: 'lost-item-2',
				type: 'found',
				documentType: 'national_id',
				documentHolderName: 'TRAORE Fatou',
				documentNumber: 'ci00-1234-5678',
			})

			expect(computeMatchScore(source, candidate)).toBe(
				baseline + SCORE_SAME_DOCUMENT_NUMBER + SCORE_SAME_DOCUMENT_TYPE,
			)
		})
	})
})
