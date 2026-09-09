/**
 * What the worker shows for a push, kept apart from the worker itself so it can
 * be read in the `node` project — the split `cache-policy.ts` already uses.
 */

export interface PushNotice {
	title: string
	body: string
	link: string
}

const FALLBACK: PushNotice = {
	title: 'RetrouveCI',
	body: 'Vous avez une nouvelle notification.',
	link: '/notifications',
}

function textOf(value: unknown): string | null {
	return typeof value === 'string' && value.trim() ? value.trim() : null
}

// A `link` is turned into a path: it arrives over the wire, and a push that
// could open any origin would be an open redirect with a notification for a UI.
function pathOf(value: unknown): string | null {
	const link = textOf(value)

	return link?.startsWith('/') && !link.startsWith('//') ? link : null
}

/**
 * ⚠️ Never throws and always answers something showable. `userVisibleOnly` is a
 * promise to the browser: a push that showed nothing would have Chrome post its
 * own « site updated in background » notice instead, so an unreadable payload
 * still gets a notice of ours.
 */
export function toPushNotice(raw: string | null | undefined): PushNotice {
	if (!raw) return FALLBACK

	try {
		const data = JSON.parse(raw) as Record<string, unknown>

		return {
			title: textOf(data.title) ?? FALLBACK.title,
			body: textOf(data.message) ?? FALLBACK.body,
			link: pathOf(data.link) ?? FALLBACK.link,
		}
	} catch {
		return FALLBACK
	}
}
