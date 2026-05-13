'use client'

import { Button } from '@retrouve-ci/ui/components'
import { useState } from 'react'
import { TopBar } from '@/components/topbar'
import { BentoCard } from '@/components/bento-card'
import { cn } from '@retrouve-ci/ui/utils'
import { useNotifications } from '@/application/notifications/use-notifications'
import type { Notification } from '@/domain/entities/notification'
import { CheckCheck } from 'lucide-react'
import { NotificationStatsRow } from './components/NotificationStatsRow'
import { NotificationList } from './components/NotificationList'

export default function NotificationsPage() {
	const { notifications, unreadCount, markAsRead, markAllAsRead, remove } =
		useNotifications()
	const [typeFilter, setTypeFilter] = useState<string>('all')
	const [readFilter, setReadFilter] = useState<string>('all')

	const totalByType = (type: Notification['type']) =>
		notifications.filter(n => n.type === type).length

	let filtered = [...notifications].sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
	)
	if (typeFilter !== 'all')
		filtered = filtered.filter(n => n.type === typeFilter)
	if (readFilter === 'unread') filtered = filtered.filter(n => !n.read)
	if (readFilter === 'read') filtered = filtered.filter(n => n.read)

	return (
		<>
			<TopBar title="Notifications" />
			<div className="pt-16">
				<div className="space-y-4 p-4 lg:p-6">
					<NotificationStatsRow
						unread={unreadCount}
						orders={totalByType('order')}
						posts={totalByType('post')}
						users={totalByType('user')}
						qr={totalByType('qr')}
					/>

					<BentoCard variant="table">
						<div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
							<div className="flex flex-wrap items-center gap-2">
								{['all', 'unread', 'read'].map(val => (
									<button
										key={val}
										onClick={() => setReadFilter(val)}
										className={cn(
											'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
											readFilter === val
												? 'bg-primary text-primary-foreground'
												: 'bg-muted text-muted-foreground hover:bg-muted/80',
										)}
									>
										{val === 'all'
											? 'Toutes'
											: val === 'unread'
												? 'Non lues'
												: 'Lues'}
									</button>
								))}

								<div className="bg-border mx-1 h-5 w-px" />

								{(
									['all', 'order', 'post', 'user', 'qr', 'system'] as const
								).map(val => (
									<button
										key={val}
										onClick={() => setTypeFilter(val)}
										className={cn(
											'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
											typeFilter === val
												? 'bg-foreground text-background'
												: 'bg-muted text-muted-foreground hover:bg-muted/80',
										)}
									>
										{val === 'all'
											? 'Tous types'
											: val === 'order'
												? 'Commande'
												: val === 'post'
													? 'Post'
													: val === 'user'
														? 'Utilisateur'
														: val === 'qr'
															? 'QR Code'
															: 'Système'}
									</button>
								))}
							</div>

							{unreadCount > 0 && (
								<Button
									variant="outline"
									size="sm"
									onClick={markAllAsRead}
									className="gap-1.5 rounded-lg text-xs"
								>
									<CheckCheck size={14} />
									Tout marquer comme lu
								</Button>
							)}
						</div>

						<NotificationList
							notifications={filtered}
							onMarkAsRead={markAsRead}
							onRemove={remove}
						/>
					</BentoCard>
				</div>
			</div>
		</>
	)
}
