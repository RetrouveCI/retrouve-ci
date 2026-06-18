import { useState, useMemo } from 'react'
import { Link, useFetcher } from 'react-router'
import { Bell, BellOff, ArrowLeft, CheckCheck } from 'lucide-react'
import { Button } from '@retrouve-ci/ui/components'
import { cn } from '@retrouve-ci/ui/utils'
import type { Notification } from '@/shared/types/notification'
import { NotificationItem } from './notification-item'

type Filter = 'all' | 'unread' | 'read'

interface NotificationsPageProps {
	items: Notification[]
	unreadCount: number
}

const DAY_MS = 24 * 60 * 60 * 1000

interface NotificationGroup {
	label: string
	items: Notification[]
}

function groupByPeriod(items: Notification[]): NotificationGroup[] {
	const now = Date.now()
	const today: Notification[] = []
	const week: Notification[] = []
	const older: Notification[] = []

	for (const item of items) {
		const age = now - new Date(item.createdAt).getTime()
		if (age < DAY_MS) today.push(item)
		else if (age < 7 * DAY_MS) week.push(item)
		else older.push(item)
	}

	return [
		{ label: "Aujourd'hui", items: today },
		{ label: 'Cette semaine', items: week },
		{ label: 'Plus ancien', items: older },
	].filter(group => group.items.length > 0)
}

export function NotificationsPage({
	items,
	unreadCount,
}: NotificationsPageProps) {
	const [filter, setFilter] = useState<Filter>('all')
	const actionFetcher = useFetcher<{ ok: boolean }>()

	const filteredItems = useMemo(() => {
		if (filter === 'unread') return items.filter(n => !n.read)
		if (filter === 'read') return items.filter(n => n.read)
		return items
	}, [items, filter])

	const groups = useMemo(() => groupByPeriod(filteredItems), [filteredItems])

	const readCount = items.length - unreadCount

	const handleMarkAllAsRead = () => {
		actionFetcher.submit(
			{ intent: 'mark-all-read' },
			{ method: 'post', action: '/notifications' },
		)
	}

	return (
		<main className="flex-1">
			<section className="relative overflow-hidden border-b">
				<div className="pointer-events-none absolute inset-0">
					<div className="bg-primary-green/5 absolute -top-20 right-0 h-96 w-96 rounded-full blur-3xl" />
				</div>
				<div className="relative container mx-auto px-4 py-8">
					<Link
						to="/account"
						className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1.5 text-sm transition-colors"
					>
						<ArrowLeft className="h-4 w-4" />
						Retour au compte
					</Link>
					<div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
						<div className="flex items-center gap-4">
							<div className="bg-primary-green/10 flex h-14 w-14 items-center justify-center rounded-2xl">
								<Bell className="text-primary-green h-7 w-7" />
							</div>
							<div>
								<h1 className="text-2xl font-bold">Notifications</h1>
								<p className="text-muted-foreground">
									{items.length} notification
									{items.length > 1 ? 's' : ''} ·{' '}
									{unreadCount > 0
										? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}`
										: 'Tout est lu'}
								</p>
							</div>
						</div>
						{unreadCount > 0 && (
							<Button
								onClick={handleMarkAllAsRead}
								disabled={actionFetcher.state !== 'idle'}
								variant="outline"
								className="gap-2 rounded-xl"
							>
								<CheckCheck className="h-4 w-4" />
								Tout marquer comme lu
							</Button>
						)}
					</div>
				</div>
			</section>

			<section className="border-b py-4">
				<div className="container mx-auto px-4">
					<div className="flex items-center gap-2">
						<button
							onClick={() => setFilter('all')}
							className={cn(
								'rounded-full px-3 py-1.5 text-xs font-medium transition-all',
								filter === 'all'
									? 'bg-foreground text-background'
									: 'bg-muted text-muted-foreground hover:bg-muted/80',
							)}
						>
							Toutes ({items.length})
						</button>
						<button
							onClick={() => setFilter('unread')}
							className={cn(
								'rounded-full px-3 py-1.5 text-xs font-medium transition-all',
								filter === 'unread'
									? 'bg-primary-green text-white'
									: 'bg-muted text-muted-foreground hover:bg-muted/80',
							)}
						>
							Non lues ({unreadCount})
						</button>
						<button
							onClick={() => setFilter('read')}
							className={cn(
								'rounded-full px-3 py-1.5 text-xs font-medium transition-all',
								filter === 'read'
									? 'bg-muted-foreground text-background'
									: 'bg-muted text-muted-foreground hover:bg-muted/80',
							)}
						>
							Lues ({readCount})
						</button>
					</div>
				</div>
			</section>

			<section className="py-6">
				<div className="container mx-auto px-4">
					{filteredItems.length > 0 ? (
						<div className="space-y-6">
							{groups.map(group => (
								<div key={group.label}>
									<h2 className="text-muted-foreground mb-2 px-1 text-xs font-semibold tracking-wide uppercase">
										{group.label}
									</h2>
									<div className="divide-y overflow-hidden rounded-2xl border">
										{group.items.map(notification => (
											<NotificationItem
												key={notification.id}
												notification={notification}
												actionFetcher={actionFetcher}
											/>
										))}
									</div>
								</div>
							))}
						</div>
					) : items.length > 0 ? (
						<div className="bg-muted/30 rounded-2xl border-2 border-dashed py-12 text-center">
							<BellOff className="text-muted-foreground mx-auto mb-3 h-10 w-10" />
							<h3 className="mb-2 text-lg font-semibold">Aucun résultat</h3>
							<p className="text-muted-foreground text-sm">
								Aucune notification ne correspond à ce filtre.
							</p>
						</div>
					) : (
						<div className="bg-muted/30 rounded-2xl border-2 border-dashed py-16 text-center">
							<div className="bg-muted mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl">
								<BellOff className="text-muted-foreground h-8 w-8" />
							</div>
							<h3 className="mb-2 text-lg font-semibold">
								Aucune notification
							</h3>
							<p className="text-muted-foreground mx-auto mb-6 max-w-sm">
								Vous n&apos;avez pas encore de notifications. Elles apparaîtront
								ici quand une correspondance sera trouvée pour vos annonces.
							</p>
							<Button
								asChild
								className="bg-primary-green hover:bg-primary-green-dark gap-2 rounded-xl text-white"
							>
								<Link to="/publish">Publier une annonce</Link>
							</Button>
						</div>
					)}
				</div>
			</section>
		</main>
	)
}
