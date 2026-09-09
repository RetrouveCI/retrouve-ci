import { Link } from 'react-router'
import { ChevronRight, ScanLine } from 'lucide-react'

/**
 * One card for the whole waiting batch, where the artboard draws one per
 * sticker. It cannot draw one each: a sticker becomes somebody's row only when
 * it is activated, so the twelve waiting in an envelope are a number and not a
 * list. Tapping it goes back to the scanner, which is the only way to name one.
 */
export function PendingStickersCard({ pending }: { pending: number }) {
	const plural = pending > 1

	return (
		<Link
			to="/scan"
			className="bg-card hover:bg-muted/40 flex items-center gap-3 rounded-2xl border border-yellow-700/30 p-3.5 transition-colors"
		>
			<span className="bg-muted flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
				<ScanLine className="text-muted-foreground h-5.5 w-5.5" />
			</span>
			<span className="min-w-0 flex-1">
				<span className="block font-semibold">
					{pending} sticker{plural ? 's' : ''} en attente
				</span>
				<span className="text-muted-foreground block text-xs">
					Scannez-{plural ? 'les' : 'le'} pour {plural ? 'les' : 'le'} nommer
				</span>
			</span>
			<ChevronRight className="text-muted-foreground h-4.5 w-4.5 shrink-0" />
		</Link>
	)
}
