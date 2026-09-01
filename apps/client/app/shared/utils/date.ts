import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

/** « il y a 3 jours » — lower case, so it can be read inside a sentence. */
export function formatRelativeDistance(isoDate: string): string {
	return formatDistanceToNow(new Date(isoDate), { addSuffix: true, locale: fr })
}

export function formatRelativeDate(isoDate: string): string {
	const relative = formatRelativeDistance(isoDate)

	return relative.charAt(0).toUpperCase() + relative.slice(1)
}
