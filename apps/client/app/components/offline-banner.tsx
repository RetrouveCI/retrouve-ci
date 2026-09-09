import { WifiOff } from 'lucide-react'
import { useOnlineStatus } from '@/shared/hooks/use-online-status'

/**
 * Sits in the flow rather than in the header's place, as the artboard draws it:
 * a banner is the primitive §2.1 names for an explanation, the moderation one
 * already reads this way, and the header holds the navigation a visitor still
 * needs with no network.
 */
export function OfflineBanner() {
	const online = useOnlineStatus()
	if (online) return null

	return (
		<div className="px-4 pt-3 lg:px-6">
			<div
				role="status"
				className="flex items-center gap-2.5 rounded-2xl border border-yellow-500/30 bg-yellow-50 px-3.5 py-2.5 text-yellow-900 dark:border-yellow-500/25 dark:bg-yellow-950/40 dark:text-yellow-100"
			>
				<WifiOff className="h-4.5 w-4.5 shrink-0" />
				<p className="text-sm font-semibold">Vous êtes hors connexion</p>
			</div>
		</div>
	)
}
