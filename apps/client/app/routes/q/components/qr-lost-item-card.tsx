import { Link } from 'react-router'
import { Search } from 'lucide-react'
import type { LinkedLostItem } from '../servers/qr-contact.service'

/**
 * Drawn only when the API sent a listing, and it sends one only when published
 * and still active — this page decides nothing about what may be shown.
 */
export function QrLostItemCard({ lostItem }: { lostItem: LinkedLostItem }) {
	return (
		<Link
			to={`/posts/${lostItem.id}`}
			className="border-accent-orange/40 bg-accent-orange/10 hover:bg-accent-orange/15 flex min-h-16 items-center gap-3 rounded-[14px] border p-3.5 transition-colors"
		>
			{lostItem.photo ? (
				<img
					src={lostItem.photo}
					alt=""
					className="h-12 w-12 shrink-0 rounded-xl object-cover"
				/>
			) : (
				<span className="bg-accent-orange/20 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
					<Search className="text-accent-orange-text h-5 w-5" />
				</span>
			)}
			<span className="min-w-0 flex-1">
				<span className="text-accent-orange-text block text-xs font-semibold tracking-[0.06em] uppercase">
					Déclaré perdu
				</span>
				<span className="block truncate font-semibold">{lostItem.title}</span>
				<span className="text-muted-foreground block truncate text-xs">
					{lostItem.ville} · voir l&apos;annonce
				</span>
			</span>
		</Link>
	)
}
