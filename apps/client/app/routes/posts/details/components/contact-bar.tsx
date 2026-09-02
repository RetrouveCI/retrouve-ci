import { Phone } from 'lucide-react'
import { ShareMenu } from './share-menu'
import { WhatsAppIcon } from './whatsapp-icon'
import {
	buildContactMessage,
	buildWhatsAppContactUrl,
} from '../helpers/contact-links'

interface LostItem {
	title: string
	type: 'lost' | 'found'
	contact: { whatsapp: string }
}

/**
 * The screen's one dominant action (§2.1), and the reason R10 exists: the contact
 * card used to fall under the description, so on a phone the whole point of the
 * page was below the fold.
 *
 * `sticky` rather than `fixed`, so the bar costs no permanent strip of viewport:
 * it pins while there is article left to read and comes to rest at the end of it.
 * The offset clears the tab bar, which is `fixed` at `bottom-0` under `lg`.
 */
export function ContactBar({ listing }: { listing: LostItem }) {
	const href = buildWhatsAppContactUrl(
		listing.contact.whatsapp,
		buildContactMessage(listing.title, listing.type),
	)

	return (
		<div className="bg-background sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 flex items-center gap-3 border-t px-4 pt-3 pb-4 shadow-[0_-6px_20px_rgba(18,32,26,0.07)] lg:bottom-0 dark:shadow-[0_-6px_20px_rgba(0,0,0,0.4)]">
			<ShareMenu title={listing.title} type={listing.type} />

			{href ? (
				<a
					href={href}
					target="_blank"
					rel="noopener noreferrer"
					className="bg-primary-green hover:bg-primary-green-dark h-control flex flex-1 items-center justify-center gap-2.5 rounded-[14px] text-lg font-semibold text-white transition-colors"
				>
					<WhatsAppIcon className="h-4.5 w-4.5" />
					Contacter par WhatsApp
				</a>
			) : (
				/*
				 * A number the gateway could never reach is a fourth state, not an
				 * edge case (§2.3, règle 5): saying so beats a link that opens
				 * WhatsApp on « ce numéro n'est pas sur WhatsApp ».
				 */
				<p className="text-muted-foreground h-control flex flex-1 items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-dashed text-center text-sm">
					<Phone className="h-4 w-4 shrink-0" />
					Numéro de contact indisponible
				</p>
			)}
		</div>
	)
}
