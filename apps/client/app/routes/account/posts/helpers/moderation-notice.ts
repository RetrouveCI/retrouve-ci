import type {
	ListingModeration,
	ModerationReason,
	ModerationStatus,
} from '@/shared/types/lost-item'

/**
 * The sentence the poster reads, from the code the moderator chose — which is
 * what makes the same fault read the same way twice. Lower-case: the card
 * prefixes « Motif : ». ⚠️ None promises a return online: the artboard said
 * « Modifiez-la pour republier », and `repository.update()` writes no
 * moderation status — the lie R12 caught.
 */
const REASON_SENTENCES: Record<ModerationReason, string> = {
	document_number_visible: 'la photo laisse lire un numéro de pièce.',
	unclear_photo: "la photo ne permet pas de reconnaître l'objet.",
	vague_description:
		'la description est trop vague pour permettre un rapprochement.',
	contact_in_description:
		'la description contient vos coordonnées. Le contact passe par le bouton WhatsApp.',
	duplicate: 'cette annonce fait doublon avec une autre.',
	off_topic: 'cette annonce ne concerne pas un objet perdu ou trouvé.',
	other: '',
}

/** `other` has no sentence of its own: the moderator wrote it. */
export function moderationReasonSentence(
	moderation: ListingModeration,
): string | null {
	if (moderation.reason === 'other') return moderation.note ?? null

	return REASON_SENTENCES[moderation.reason]
}

export interface ModerationNotice {
	title: string
	detail: string
}

const plural = (count: number) => (count > 1 ? 's' : '')

/**
 * Moderation is the axis the visitor does not choose (§2.3 rule 1), so it is
 * reported once above the list instead of being a bucket to browse.
 *
 * Every sentence here says what the API actually does. « Masquée » does not
 * promise a review after an edit: `repository.update()` never writes a
 * moderation status, which is the finding R12 recorded. The banner counts;
 * each card carries its own reason since A1.
 */
export function buildModerationNotice(
	moderation: Record<ModerationStatus, number>,
): ModerationNotice | null {
	const { pending, hidden } = moderation

	if (pending > 0 && hidden > 0) {
		return {
			title: `${pending} annonce${plural(pending)} en attente de validation, ${hidden} masquée${plural(hidden)}`,
			detail: "Aucune d'elles n'est visible publiquement.",
		}
	}

	if (pending > 0) {
		return {
			title: `${pending} annonce${plural(pending)} en attente de validation`,
			detail:
				pending > 1
					? "Elles ne sont visibles que de vous, jusqu'à ce qu'un modérateur les valide."
					: "Elle n'est visible que de vous, jusqu'à ce qu'un modérateur la valide.",
		}
	}

	if (hidden > 0) {
		return {
			title: `${hidden} annonce${plural(hidden)} masquée${plural(hidden)} par la modération`,
			detail:
				hidden > 1
					? 'Elles ne sont plus visibles publiquement, et les corriger ne les remet pas en ligne.'
					: "Elle n'est plus visible publiquement, et la corriger ne la remet pas en ligne.",
		}
	}

	return null
}
