import type { LostItem } from '@/domains/lost-items/models/lost-item.model'
import {
	EVENT_DATE_CLOSE_DAYS,
	EVENT_DATE_NEAR_DAYS,
	MIN_OVERLAP_WORD_LENGTH,
	SCORE_EVENT_DATE_CLOSE,
	SCORE_EVENT_DATE_NEAR,
	SCORE_SAME_CATEGORY,
	SCORE_SAME_COMMUNE,
	SCORE_SAME_VILLE,
	SCORE_TEXT_OVERLAP,
} from '../constants'

const MS_PER_DAY = 1000 * 60 * 60 * 24

export function computeMatchScore(
	source: LostItem,
	candidate: LostItem,
): number {
	let score = 0

	if (source.category === candidate.category) {
		score += SCORE_SAME_CATEGORY
	}

	if (source.ville.toLowerCase() === candidate.ville.toLowerCase()) {
		score += SCORE_SAME_VILLE
	}

	if (
		source.commune &&
		candidate.commune &&
		source.commune.toLowerCase() === candidate.commune.toLowerCase()
	) {
		score += SCORE_SAME_COMMUNE
	}

	const daysApart = Math.abs(
		(source.eventDate.getTime() - candidate.eventDate.getTime()) / MS_PER_DAY,
	)

	if (daysApart <= EVENT_DATE_CLOSE_DAYS) {
		score += SCORE_EVENT_DATE_CLOSE
	} else if (daysApart <= EVENT_DATE_NEAR_DAYS) {
		score += SCORE_EVENT_DATE_NEAR
	}

	if (hasTextOverlap(source, candidate)) {
		score += SCORE_TEXT_OVERLAP
	}

	return score
}

function hasTextOverlap(source: LostItem, candidate: LostItem): boolean {
	const sourceWords = extractWords(`${source.title} ${source.description}`)
	const candidateWords = extractWords(
		`${candidate.title} ${candidate.description}`,
	)

	return sourceWords.some(word => candidateWords.includes(word))
}

function extractWords(text: string): string[] {
	return text
		.toLowerCase()
		.split(/[^a-z0-9àâäéèêëïîôöùûüÿç]+/)
		.filter(word => word.length >= MIN_OVERLAP_WORD_LENGTH)
}
