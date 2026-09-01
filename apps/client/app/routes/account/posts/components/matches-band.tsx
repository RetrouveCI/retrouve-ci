import { ChevronRight, Search } from 'lucide-react'
import type { LostItem } from '@/shared/types/lost-item'
import {
	buildMatchesSubtitle,
	buildMatchesTitle,
} from '../helpers/listing-matches'
import type { ListingMatches } from '../types/matches'

interface MatchesBandProps {
	matches: ListingMatches
	type: LostItem['type']
	ville: string | undefined
	onOpen: () => void
}

/**
 * The answer to the one question this screen exists for — « est-ce qu'on a
 * retrouvé mon truc ? ». It sits where R13 removed the row of buttons, and it
 * appears only when there is something to say: no band means no matches, never
 * an empty promise.
 *
 * Both themes are named, as R3 requires of a fixed surface. The circle keeps
 * the brand green at both, white on `--primary-green` measuring 5,03:1.
 */
export function MatchesBand({
	matches,
	type,
	ville,
	onOpen,
}: MatchesBandProps) {
	return (
		<button
			type="button"
			onClick={onOpen}
			aria-haspopup="dialog"
			className="flex w-full items-center gap-3 border-t border-green-600/20 bg-green-50 px-3.5 py-3 text-left text-green-900 transition-colors hover:bg-green-100 dark:border-green-500/20 dark:bg-green-950/40 dark:text-green-100 dark:hover:bg-green-950/60"
		>
			<span className="bg-primary-green flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
				<Search className="h-4 w-4 text-white" />
			</span>
			<span className="min-w-0 flex-1">
				<span className="block text-[13px] leading-tight font-semibold">
					{buildMatchesTitle(matches.count, type)}
				</span>
				<span className="mt-0.5 block truncate text-xs opacity-80">
					{buildMatchesSubtitle(matches, ville)}
				</span>
			</span>
			<ChevronRight className="h-4.5 w-4.5 shrink-0 opacity-70" />
		</button>
	)
}
