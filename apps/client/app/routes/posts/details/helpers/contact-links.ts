import {
	COUNTRY_CODE,
	isValidLocalNumber,
	toLocalDigits,
} from '@/shared/utils/phone'

/**
 * The poster's number reaches this page as the API stored it — E.164 for
 * anything published since the contract took over the field, but older rows hold
 * whatever the client used to prefix `+225` onto. `null` is therefore a real
 * answer, not a defensive flourish: a `wa.me` link built on ten wrong digits
 * opens WhatsApp on « ce numéro n'est pas sur WhatsApp », which reads as the app
 * being broken rather than the number being unusable.
 *
 * `wa.me` addresses a recipient as bare digits with the country code and no
 * `+` — the same shape `toLetextoRecipient` builds for the SMS gateway.
 */
export function buildWhatsAppContactUrl(
	phone: string,
	message: string,
): string | null {
	if (!isValidLocalNumber(phone)) return null

	const recipient = `${COUNTRY_CODE}${toLocalDigits(phone)}`

	return `https://wa.me/${recipient}?text=${encodeURIComponent(message)}`
}

/**
 * Who writes to whom depends on the listing: a **lost** item is contacted by
 * whoever may have found it, a **found** item by whoever lost it. The title is
 * what identifies the listing on the other end, so it carries no URL — the
 * recipient is the poster, who does not need a link to their own annonce.
 */
export function buildContactMessage(
	title: string,
	type: 'lost' | 'found',
): string {
	return type === 'lost'
		? `Bonjour, j'ai peut-être trouvé votre objet : « ${title} ». Je vous écris depuis RetrouveCI.`
		: `Bonjour, l'objet que vous avez trouvé est peut-être le mien : « ${title} ». Je vous écris depuis RetrouveCI.`
}
