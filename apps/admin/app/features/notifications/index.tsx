import { useEffect } from 'react'
import { useSearchParams, useFetcher } from 'react-router'
import { Button } from '@retrouve-ci/ui/components'
import { TopBar } from '@/shared/components/topbar'
import { BentoCard } from '@/shared/components/bento-card'
import { NotificationList } from './components/notification-list'
import { notificationsLoader } from './servers/notifications.loader'
import { notificationsAction } from './servers/notifications.action'
import { CheckCheck, Bell, BellOff } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@retrouve-ci/ui/utils'
import type { Notification } from './notifications.types'
import type { Route } from './+types/index'

export const loader = notificationsLoader
export const action = notificationsAction

interface ActionResult {
	ok: boolean
	notification?: Notification
	intent?: string
	error?: string
}

export default function NotificationsPage({
	loaderData,
}: Route.ComponentProps) {
	const { notifications, total, readFilter } = loaderData
	const [searchParams, setSearchParams] = useSearchParams()

	const readFetcher = useFetcher<ActionResult>()
	const markAllFetcher = useFetcher<ActionResult>()

	useEffect(() => {
		if (readFetcher.state !== 'idle' || !readFetcher.data) return
		if (!readFetcher.data.ok) {
			toast.error(readFetcher.data.error ?? 'Impossible de marquer comme lu')
		}
	}, [readFetcher.state, readFetcher.data])

	useEffect(() => {
		if (markAllFetcher.state !== 'idle' || !markAllFetcher.data) return
		if (markAllFetcher.data.ok) {
			toast.success('Toutes les notifications ont été marquées comme lues')
		} else {
			toast.error(markAllFetcher.data.error ?? 'Erreur')
		}
	}, [markAllFetcher.state, markAllFetcher.data])

	const handleMarkAsRead = (id: string) => {
		readFetcher.submit({ intent: 'mark-read', id }, { method: 'post' })
	}

	const handleMarkAllAsRead = () => {
		markAllFetcher.submit({ intent: 'mark-all-read' }, { method: 'post' })
	}

	const handleFilterChange = (value: string) => {
		const next = new URLSearchParams(searchParams)
		if (value === 'all') {
			next.delete('read')
		} else if (value === 'unread') {
			next.set('read', 'false')
		} else {
			next.set('read', 'true')
		}
		setSearchParams(next)
	}

	const unreadCount = notifications.filter(n => !n.read).length

	const FILTER_OPTIONS = [
		{ value: 'all', label: 'Toutes', icon: Bell },
		{ value: 'unread', label: 'Non lues', icon: BellOff },
		{ value: 'read', label: 'Lues', icon: CheckCheck },
	]

	const activeFilter =
		readFilter === 'false' ? 'unread' : readFilter === 'true' ? 'read' : 'all'

	return (
		<>
			<TopBar title="Notifications" />
			<div className="pt-16">
				<div className="space-y-4 p-4 lg:p-6">
					<div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
						<BentoCard
							variant="highlight"
							title="Total"
							value={total}
							icon={Bell}
						/>
						<BentoCard
							variant="stat"
							title="Non lues"
							value={unreadCount}
							icon={BellOff}
							iconColor="text-orange-600"
							iconBgColor="bg-orange-50"
						/>
						<BentoCard
							variant="stat"
							title="Lues"
							value={total - unreadCount}
							icon={CheckCheck}
							iconColor="text-green-600"
							iconBgColor="bg-green-50"
						/>
					</div>

					<BentoCard variant="table">
						<div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
							<div className="bg-muted/60 inline-flex flex-wrap items-center gap-0.5 rounded-lg p-0.5">
								{FILTER_OPTIONS.map(({ value, label }) => (
									<button
										key={value}
										type="button"
										onClick={() => handleFilterChange(value)}
										className={cn(
											'rounded-md px-3 py-1 text-xs font-medium transition-colors',
											activeFilter === value
												? 'bg-card text-foreground shadow-sm'
												: 'text-muted-foreground hover:text-foreground',
										)}
									>
										{label}
									</button>
								))}
							</div>

							{unreadCount > 0 && (
								<Button
									variant="outline"
									size="sm"
									onClick={handleMarkAllAsRead}
									disabled={markAllFetcher.state !== 'idle'}
									className="gap-1.5 rounded-lg text-xs"
								>
									<CheckCheck size={14} />
									Tout marquer comme lu
								</Button>
							)}
						</div>

						<NotificationList
							notifications={notifications}
							onMarkAsRead={handleMarkAsRead}
						/>
					</BentoCard>
				</div>
			</div>
		</>
	)
}
