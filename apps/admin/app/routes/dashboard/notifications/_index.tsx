import { useActionFetcher } from '@/shared/hooks/use-action-fetcher'
import { useSettledSubmission } from '@/shared/hooks/use-settled-submission'
import { useSearchParams } from 'react-router'
import { Button } from '@app/ui/components'
import { BentoCard } from '@/components/bento-card'
import { StatCard } from '@/components/stat-card'
import { NotificationList } from './components/notification-list'
import { notificationsLoader } from './servers/notifications.loader'
import { notificationsAction } from './servers/notifications.action'
import { CheckCheck, Bell, BellOff, BellRing } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@app/ui/utils'
import type { RouteHandle } from '@/shared/helpers/page-meta'
import type { Route } from './+types/_index'

export const loader = notificationsLoader
export const action = notificationsAction

export const handle: RouteHandle = { title: 'Notifications' }

export default function NotificationsPage({
	loaderData,
}: Route.ComponentProps) {
	const { notifications, total, readFilter, pushDevices } = loaderData
	const [searchParams, setSearchParams] = useSearchParams()

	const readFetcher = useActionFetcher<typeof notificationsAction>()
	const markAllFetcher = useActionFetcher<typeof notificationsAction>()

	useSettledSubmission(readFetcher.response, result => {
		if (!result.success)
			toast.error(
				result.errors?.root?.message ?? 'Impossible de marquer comme lu',
			)
	})

	useSettledSubmission(markAllFetcher.response, result => {
		if (result.success) {
			toast.success('Toutes les notifications ont été marquées comme lues')
			return
		}

		toast.error(result.errors?.root?.message ?? 'Erreur')
	})

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
			<div>
				<div className="space-y-4 p-4 lg:p-6">
					<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
						<StatCard highlight title="Total" value={total} icon={Bell} />
						<StatCard
							tone="warning"
							title="Non lues"
							value={unreadCount}
							icon={BellOff}
						/>
						<StatCard
							tone="success"
							title="Lues"
							value={total - unreadCount}
							icon={CheckCheck}
						/>
						{/* The figure A3 waits on: a subscription needs an install and a
						    granted permission, so it says whether a push would reach
						    anyone. Sending is not wired yet. */}
						<StatCard
							title="Appareils abonnés"
							value={pushDevices ?? '—'}
							icon={BellRing}
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
