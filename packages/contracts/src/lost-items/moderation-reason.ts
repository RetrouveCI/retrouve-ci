import type { ModerationReason } from './enums.schema'

/**
 * The sentence the poster reads, from the code the moderator chose — which is
 * what makes the same fault read the same way twice. Lower-case, because every
 * caller prefixes « Motif : ». ⚠️ None promises a return online: the artboard
 * said « Modifiez-la pour republier », and `repository.update()` writes no
 * moderation status — the lie R12 caught.
 *
 * Here rather than in a front because the poster reads it in two places now:
 * on the card, and in the notification N2 raises.
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

export interface ModerationReasonDetail {
	reason: ModerationReason
	note?: string | null
}

/** `other` has no sentence of its own: the moderator wrote it. */
export function moderationReasonSentence({
	reason,
	note,
}: ModerationReasonDetail): string | null {
	if (reason === 'other') return note ?? null

	return REASON_SENTENCES[reason]
}
