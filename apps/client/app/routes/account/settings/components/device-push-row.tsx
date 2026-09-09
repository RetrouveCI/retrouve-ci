import { useEffect, useState } from 'react'
import { Switch } from '@app/ui/components'
import { toast } from 'sonner'
import { useActionFetcher } from '@/shared/hooks/use-action-fetcher'
import {
	currentRegistration,
	pushUnavailable,
	subscribe,
	unsubscribe,
	type PushUnavailable,
} from '../helpers/push.client'

// A subscription belongs to **this browser**, not to the account: the two
// switches above are per-type preferences nothing stores yet, and this one is a
// device capability the visitor granted.
const UNAVAILABLE_NOTE: Record<PushUnavailable, string> = {
	unsupported: 'Cet appareil ne gère pas les notifications.',
	unconfigured: 'Les notifications ne sont pas encore activées côté serveur.',
	denied:
		'Notifications bloquées pour ce site. Autorisez-les dans les réglages de votre navigateur.',
	dismissed: 'Autorisation refusée. Vous pouvez réessayer.',
}

export function DevicePushRow() {
	const fetcher = useActionFetcher()
	const [enabled, setEnabled] = useState(false)
	const [blocked, setBlocked] = useState<PushUnavailable | null>(null)
	const [busy, setBusy] = useState(true)

	// Read once on mount: the browser is the source of truth for whether this
	// device holds a subscription, not the account.
	useEffect(() => {
		let live = true

		void (async () => {
			const reason = pushUnavailable()
			const registration = reason ? null : await currentRegistration()

			if (!live) return

			setBlocked(reason)
			setEnabled(Boolean(registration))
			setBusy(false)
		})()

		return () => {
			live = false
		}
	}, [])

	async function toggle(next: boolean) {
		setBusy(true)

		if (!next) {
			const endpoint = await unsubscribe()
			if (endpoint) {
				void fetcher.submit(
					{ intent: 'unsubscribe-push', endpoint },
					{ method: 'post' },
				)
			}
			setEnabled(false)
			setBusy(false)
			return
		}

		const outcome = await subscribe()

		if (typeof outcome === 'string') {
			setBlocked(outcome === 'dismissed' ? null : outcome)
			setBusy(false)
			toast.error(UNAVAILABLE_NOTE[outcome])
			return
		}

		void fetcher.submit(
			{ intent: 'subscribe-push', ...outcome },
			{ method: 'post' },
		)
		setEnabled(true)
		setBusy(false)
	}

	const note = blocked ? UNAVAILABLE_NOTE[blocked] : null

	return (
		<div className="bg-background flex items-center gap-3.5 rounded-2xl border p-4">
			<div className="flex-1">
				<p className="text-sm font-semibold">Notifications sur cet appareil</p>
				<p className="text-muted-foreground mt-0.5 text-xs">
					{note ?? 'Recevez une alerte même quand l’application est fermée.'}
				</p>
			</div>
			<Switch
				checked={enabled}
				disabled={busy || Boolean(blocked)}
				onCheckedChange={next => void toggle(next)}
				aria-label="Notifications sur cet appareil"
				className="shrink-0"
			/>
		</div>
	)
}
