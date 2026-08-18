import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

export function formatRelativeDate(isoDate: string): string {
	const relative = formatDistanceToNow(new Date(isoDate), {
		addSuffix: true,
		locale: fr,
	})

	return relative.charAt(0).toUpperCase() + relative.slice(1)
}
