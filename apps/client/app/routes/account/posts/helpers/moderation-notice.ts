import type { ModerationStatus } from '@/shared/types/lost-item'

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
 * moderation status, which is the finding R12 recorded — and the reason a
 * listing was hidden is not stored at all yet (A1), so the banner counts them
 * and stops there.
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
