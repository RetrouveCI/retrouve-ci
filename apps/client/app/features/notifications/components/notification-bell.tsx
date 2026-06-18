import { useEffect, useRef, useState } from 'react'
import { Link, useFetcher } from 'react-router'
import { Bell, BellOff } from 'lucide-react'
import {
	Badge,
	Button,
	Popover,
	PopoverContent,
	PopoverTrigger,
	Separator,
} from '@retrouve-ci/ui/components'
import type { Notification } from '@/shared/types/notification'
import { NotificationItem } from './notification-item'

const POLL_INTERVAL_MS = 60_000

interface NotificationsLoaderData {
	items: Notification[]
	unreadCount: number
}

export function NotificationBell() {
	const [open, setOpen] = useState(false)
	const listFetcher = useFetcher<NotificationsLoaderData>()
	const actionFetcher = useFetcher<{ ok: boolean }>()
	const previousActionState = useRef(actionFetcher.state)

	useEffect(() => {
		listFetcher.load('/notifications')

		const interval = setInterval(() => {
			listFetcher.load('/notifications')
		}, POLL_INTERVAL_MS)

		return () => clearInterval(interval)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		if (
			previousActionState.current !== 'idle' &&
			actionFetcher.state === 'idle'
		) {
			listFetcher.load('/notifications')
		}
		previousActionState.current = actionFetcher.state
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [actionFetcher.state])

	const allItems = listFetcher.data?.items ?? []
	const items = allItems.slice(0, 5)
	const unreadCount = listFetcher.data?.unreadCount ?? 0

	const handleMarkAllAsRead = () => {
		actionFetcher.submit(
			{ intent: 'mark-all-read' },
			{ method: 'post', action: '/notifications' },
		)
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="relative h-9 w-9"
					aria-label="Notifications"
				>
					<Bell className="h-4 w-4" />
					{unreadCount > 0 && (
						<Badge className="absolute -top-1 -right-1 h-5 min-w-5 justify-center rounded-full px-1 text-[10px]">
							{unreadCount > 9 ? '9+' : unreadCount}
						</Badge>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent align="end" className="w-80 p-0">
				<div className="flex items-center justify-between px-4 py-3">
					<p className="text-sm font-semibold">Notifications</p>
					{unreadCount > 0 && (
						<button
							type="button"
							onClick={handleMarkAllAsRead}
							disabled={actionFetcher.state !== 'idle'}
							className="text-primary-green hover:text-primary-green-dark text-xs font-medium disabled:opacity-50"
						>
							Tout marquer comme lu
						</button>
					)}
				</div>
				<Separator />
				{items.length === 0 ? (
					<div className="px-4 py-8 text-center">
						<div className="bg-muted mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl">
							<BellOff className="text-muted-foreground/40 h-5 w-5" />
						</div>
						<p className="text-muted-foreground text-sm">
							Aucune notification pour le moment.
						</p>
					</div>
				) : (
					<>
						<div className="max-h-80 overflow-y-auto">
							<ul className="divide-y">
								{items.map(notification => (
									<li key={notification.id}>
										<NotificationItem
											notification={notification}
											actionFetcher={actionFetcher}
										/>
									</li>
								))}
							</ul>
						</div>
						<Separator />
						<div className="p-2">
							<Link
								to="/notifications"
								onClick={() => setOpen(false)}
								className="text-primary-green hover:bg-muted/50 block rounded-md px-3 py-2 text-center text-sm font-medium transition-colors"
							>
								Voir toutes les notifications
							</Link>
						</div>
					</>
				)}
			</PopoverContent>
		</Popover>
	)
}
