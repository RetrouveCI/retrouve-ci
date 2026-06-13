import { describe, expect, it } from 'vitest'
import type { LostItem } from '@/domains/lost-items/models/lost-item.model'
import {
	SCORE_EVENT_DATE_CLOSE,
	SCORE_EVENT_DATE_NEAR,
	SCORE_SAME_CATEGORY,
	SCORE_SAME_COMMUNE,
	SCORE_SAME_VILLE,
	SCORE_TEXT_OVERLAP,
} from '../constants'
import { computeMatchScore } from './compute-match-score'

function buildLostItem(overrides: Partial<LostItem> = {}): LostItem {
	return {
		id: 'lost-item-1',
		type: 'lost',
		category: 'phone',
		title: 'iPhone 13 perdu',
		description: 'Perdu près du marché de Cocody, coque noire avec autocollant',
		ville: 'Abidjan',
		commune: 'Cocody',
		eventDate: new Date('2026-01-01'),
		contactName: 'Jean Dupont',
		contactWhatsapp: '+2250700000000',
		photos: [],
		moderationStatus: 'published',
		resolutionStatus: 'active',
		views: 0,
		contactsCount: 0,
		userId: 'user-1',
		createdAt: new Date('2026-01-01'),
		updatedAt: new Date('2026-01-01'),
		...overrides,
	}
}

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
			SCORE_SAME_CATEGORY + SCORE_SAME_VILLE + SCORE_SAME_COMMUNE + SCORE_EVENT_DATE_CLOSE,
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
			description: 'Perdu près du marché de Cocody, coque noire avec autocollant',
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
})
