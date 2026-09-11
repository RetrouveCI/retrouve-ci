import { useActionFetcher } from '@/shared/hooks/use-action-fetcher'
import { useSettledSubmission } from '@/shared/hooks/use-settled-submission'
import { Button } from '@app/ui/components'
import { BentoCard } from '@/components/bento-card'
import { ListPager } from '@/components/list-pager'
import { ListToolbar } from '@/components/list-toolbar'
import { StatCard } from '@/components/stat-card'
import { NotificationList } from './components/notification-list'
import { notificationsLoader } from './servers/notifications.loader'
import { notificationsAction } from './servers/notifications.action'
import { CheckCheck, Bell, BellOff, BellRing } from 'lucide-react'
import { toast } from 'sonner'
import type { RouteHandle } from '@/shared/helpers/page-meta'
import type { Route } from './+types/_index'

export const loader = notificationsLoader
export const action = notificationsAction

export const handle: RouteHandle = { title: 'Notifications' }

export default function NotificationsPage({
	loaderData,
}: Route.ComponentProps) {
	const { notifications, total, page, pageSize, counts, pushDevices } =
		loaderData

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

	// Counted over every notification: the page alone would say « all read »
	// while the next one waits.
	const hasUnread =
		(counts?.unread ?? 0) > 0 || notifications.some(n => !n.read)

	return (
		<div className="space-y-4 p-4 lg:p-6">
			<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
				<StatCard
					highlight
					title="Total"
					value={counts?.all ?? total}
					icon={Bell}
				/>
				<StatCard
					tone="warning"
					title="Non lues"
					value={counts?.unread ?? '—'}
					icon={BellOff}
				/>
				<StatCard
					tone="success"
					title="Lues"
					value={counts?.read ?? '—'}
					icon={CheckCheck}
				/>
				{/* The figure A3 rests on: a subscription needs an install and a
				    granted permission, so it says whether a push would reach
				    anyone. */}
				<StatCard
					title="Appareils abonnés"
					value={pushDevices ?? '—'}
					icon={BellRing}
				/>
			</div>

			<BentoCard variant="table">
				<ListToolbar
					param="read"
					chips={[
						{ value: 'all', label: 'Toutes', count: counts?.all },
						{ value: 'false', label: 'Non lues', count: counts?.unread },
						{ value: 'true', label: 'Lues', count: counts?.read },
					]}
				>
					{hasUnread && (
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
				</ListToolbar>

				<NotificationList
					notifications={notifications}
					onMarkAsRead={handleMarkAsRead}
				/>
				<ListPager page={page} pageSize={pageSize} total={total} />
			</BentoCard>
		</div>
	)
}
