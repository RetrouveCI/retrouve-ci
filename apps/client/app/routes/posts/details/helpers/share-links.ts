export interface ShareContent {
	url: string
	title: string
	text: string
}

export function buildShareText(title: string, type: 'lost' | 'found'): string {
	const prefix = type === 'lost' ? 'Objet perdu' : 'Objet retrouvé'
	return `${prefix} : ${title} — sur RetrouveCI`
}

export function buildWhatsAppUrl({ text, url }: ShareContent): string {
	return `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`
}

export function buildFacebookUrl({ url }: ShareContent): string {
	return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
}
