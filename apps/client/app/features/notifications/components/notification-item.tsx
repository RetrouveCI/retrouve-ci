import { Link } from 'react-router'
import type { FetcherWithComponents } from 'react-router'
import { Sparkles } from 'lucide-react'
import { cn } from '@retrouve-ci/ui/utils'
import type { Notification } from '@/shared/types/notification'
import type { NotificationType } from '@/features/notifications/notifications.types'

const TYPE_ICONS: Record<NotificationType, React.ElementType> = {
	match_found: Sparkles,
}

interface NotificationItemProps {
	notification: Notification
	actionFetcher: FetcherWithComponents<unknown>
}

export function NotificationItem({
	notification,
	actionFetcher,
}: NotificationItemProps) {
	const Icon = TYPE_ICONS[notification.type] ?? Sparkles

	const handleClick = () => {
		if (notification.read) return
		actionFetcher.submit(
			{ intent: 'mark-read', id: notification.id },
			{ method: 'post', action: '/notifications' },
		)
	}

	const content = (
		<>
			<div
				className={cn(
					'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
					notification.read ? 'bg-muted' : 'bg-primary-green/10',
				)}
			>
				<Icon
					className={cn(
						'h-4 w-4',
						notification.read ? 'text-muted-foreground' : 'text-primary-green',
					)}
				/>
			</div>

			<div className="min-w-0 flex-1">
				<p
					className={cn(
						'line-clamp-1 text-sm leading-tight',
						notification.read ? 'font-medium' : 'font-semibold',
					)}
				>
					{notification.title}
				</p>
				<p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs">
					{notification.message}
				</p>
				<p className="text-muted-foreground/70 mt-1 text-[11px]">
					{notification.relativeDate}
				</p>
			</div>

			{!notification.read && (
				<span className="bg-primary-green mt-1 h-2 w-2 shrink-0 rounded-full" />
			)}
		</>
	)

	const className = cn(
		'flex items-start gap-3 px-4 py-3 text-left transition-colors',
		notification.read
			? 'hover:bg-muted/40'
			: 'bg-primary-green/[0.04] hover:bg-primary-green/[0.08]',
	)

	if (notification.link) {
		return (
			<Link to={notification.link} onClick={handleClick} className={className}>
				{content}
			</Link>
		)
	}

	return (
		<button
			type="button"
			onClick={handleClick}
			className={cn('w-full', className)}
		>
			{content}
		</button>
	)
}
