import type { LostItem } from '@/domains/lost-items/types/lost-item.types'
import {
	EVENT_DATE_CLOSE_DAYS,
	EVENT_DATE_NEAR_DAYS,
	MIN_OVERLAP_WORD_LENGTH,
	SCORE_EVENT_DATE_CLOSE,
	SCORE_EVENT_DATE_NEAR,
	SCORE_SAME_CATEGORY,
	SCORE_SAME_COMMUNE,
	SCORE_SAME_DOCUMENT_NUMBER,
	SCORE_SAME_DOCUMENT_TYPE,
	SCORE_SAME_HOLDER_NAME,
	SCORE_SAME_VILLE,
	SCORE_TEXT_OVERLAP,
} from '../constants'
import { compareHolderNames, sameDocumentNumber } from './normalize-document'

const MS_PER_DAY = 1000 * 60 * 60 * 24

export function computeMatchScore(
	source: LostItem,
	candidate: LostItem,
): number {
	const sameNumber = sameDocumentNumber(
		source.documentNumber,
		candidate.documentNumber,
	)
	const holder = compareHolderNames(
		source.documentHolderName,
		candidate.documentHolderName,
	)

	/**
	 * Two documents in one town clear the threshold on their category and their
	 * town alone, so without this the cards of two strangers in Abidjan notify
	 * each other. A disagreement on the one identifying field both sides filled
	 * in outweighs that — unless the numbers agree, in which case it is the name
	 * that was mistyped.
	 */
	if (holder === 'mismatch' && !sameNumber) {
		return 0
	}

	let score = 0

	if (sameNumber) {
		score += SCORE_SAME_DOCUMENT_NUMBER
	}

	if (holder === 'match') {
		score += SCORE_SAME_HOLDER_NAME
	}

	if (
		source.documentType !== null &&
		source.documentType === candidate.documentType
	) {
		score += SCORE_SAME_DOCUMENT_TYPE
	}

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
