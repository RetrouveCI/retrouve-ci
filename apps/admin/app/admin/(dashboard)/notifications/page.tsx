'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/admin/topbar'
import { BentoCard } from '@/components/admin/bento-card'
import { Button } from '@retrouve-ci/ui/components/ui/button'
import { Badge } from '@retrouve-ci/ui/components/ui/badge'
import { cn } from '@retrouve-ci/ui/lib/utils'
import { useNotifications } from '@/application/notifications/use-notifications'
import type { Notification } from '@/domain/entities/notification'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
	Bell,
	BellOff,
	Check,
	CheckCheck,
	Package,
	Users,
	FileText,
	QrCode,
	Settings,
	ArrowRight,
	Trash2,
} from 'lucide-react'

const typeConfig: Record<
	Notification['type'],
	{
		label: string
		icon: React.ElementType
		iconColor: string
		iconBg: string
		badgeClass: string
	}
> = {
	order: {
		label: 'Commande',
		icon: Package,
		iconColor: 'text-orange-600',
		iconBg: 'bg-orange-100',
		badgeClass: 'bg-orange-100 text-orange-700',
	},
	user: {
		label: 'Utilisateur',
		icon: Users,
		iconColor: 'text-blue-600',
		iconBg: 'bg-blue-100',
		badgeClass: 'bg-blue-100 text-blue-700',
	},
	post: {
		label: 'Post',
		icon: FileText,
		iconColor: 'text-purple-600',
		iconBg: 'bg-purple-100',
		badgeClass: 'bg-purple-100 text-purple-700',
	},
	qr: {
		label: 'QR Code',
		icon: QrCode,
		iconColor: 'text-primary',
		iconBg: 'bg-primary/10',
		badgeClass: 'bg-primary/10 text-primary',
	},
	system: {
		label: 'Système',
		icon: Settings,
		iconColor: 'text-gray-600',
		iconBg: 'bg-gray-100',
		badgeClass: 'bg-gray-100 text-gray-700',
	},
}

export default function NotificationsPage() {
	const {
		notifications,
		unreadCount,
		markAsRead,
		markAllAsRead,
		remove,
	} = useNotifications()
	const [typeFilter, setTypeFilter] = useState<string>('all')
	const [readFilter, setReadFilter] = useState<string>('all')

	const unread = unreadCount
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
					{/* Bento stats row */}
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
						<BentoCard
							variant={unread > 0 ? 'highlight' : 'stat'}
							title="Non lues"
							value={unread}
							icon={Bell}
							iconColor="text-primary"
							iconBg="bg-primary/10"
						/>
						<BentoCard
							variant="stat"
							title="Commandes"
							value={totalByType('order')}
							icon={Package}
							iconColor="text-orange-600"
							iconBgColor="bg-orange-100"
						/>
						<BentoCard
							variant="stat"
							title="Posts"
							value={totalByType('post')}
							icon={FileText}
							iconColor="text-purple-600"
							iconBgColor="bg-purple-100"
						/>
						<BentoCard
							variant="stat"
							title="Utilisateurs"
							value={totalByType('user')}
							icon={Users}
							iconColor="text-blue-600"
							iconBgColor="bg-blue-100"
						/>
						<BentoCard
							variant="stat"
							title="QR Codes"
							value={totalByType('qr')}
							icon={QrCode}
							iconColor="text-primary"
							iconBgColor="bg-primary/10"
						/>
					</div>

					{/* Table card */}
					<BentoCard variant="table">
						{/* Toolbar */}
						<div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
							<div className="flex flex-wrap items-center gap-2">
								{/* Read filter */}
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

								{/* Type filter */}
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
											: typeConfig[val as Notification['type']].label}
									</button>
								))}
							</div>

							{unread > 0 && (
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

						{/* List */}
						{filtered.length === 0 ? (
							<div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
								<div className="bg-muted flex h-14 w-14 items-center justify-center rounded-2xl">
									<BellOff className="text-muted-foreground h-7 w-7" />
								</div>
								<p className="font-semibold">Aucune notification</p>
								<p className="text-muted-foreground text-sm">
									Aucune notification ne correspond aux filtres sélectionnés.
								</p>
							</div>
						) : (
							<ul className="divide-y">
								{filtered.map(notif => {
									const cfg = typeConfig[notif.type]
									const Icon = cfg.icon
									const Wrapper = notif.link ? Link : 'div'
									const wrapperProps = notif.link
										? { href: notif.link, onClick: () => markAsRead(notif.id) }
										: {}

									return (
										<li
											key={notif.id}
											className={cn(
												'group relative flex items-start gap-4 px-5 py-4 transition-colors',
												!notif.read && 'bg-primary/[0.03]',
												notif.link && 'hover:bg-muted/50',
											)}
										>
											{/* Unread dot */}
											{!notif.read && (
												<span className="bg-primary absolute top-1/2 left-2 h-1.5 w-1.5 -translate-y-1/2 rounded-full" />
											)}

											{/* Icon */}
											<div
												className={cn(
													'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
													cfg.iconBg,
												)}
											>
												<Icon className={cn('h-5 w-5', cfg.iconColor)} />
											</div>

											{/* Content */}
											<div className="min-w-0 flex-1">
												<div className="mb-0.5 flex flex-wrap items-center gap-2">
													<span className="text-sm font-semibold">
														{notif.title}
													</span>
													<span
														className={cn(
															'rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase',
															cfg.badgeClass,
														)}
													>
														{cfg.label}
													</span>
													{!notif.read && (
														<Badge className="bg-primary/10 text-primary h-4 rounded-full px-1.5 text-[9px] font-bold">
															NOUVEAU
														</Badge>
													)}
												</div>
												<p className="text-muted-foreground text-sm leading-snug">
													{notif.message}
												</p>
												<p className="text-muted-foreground/70 mt-1 text-xs">
													{format(
														new Date(notif.createdAt),
														'd MMMM yyyy à HH:mm',
														{
															locale: fr,
														},
													)}
												</p>
											</div>

											{/* Actions */}
											<div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
												{!notif.read && (
													<Button
														variant="ghost"
														size="icon"
														className="h-8 w-8 rounded-lg"
														title="Marquer comme lu"
														onClick={() => markAsRead(notif.id)}
													>
														<Check size={14} />
													</Button>
												)}
												<Button
													variant="ghost"
													size="icon"
													className="text-muted-foreground hover:text-destructive h-8 w-8 rounded-lg"
													title="Supprimer"
													onClick={() => remove(notif.id)}
												>
													<Trash2 size={14} />
												</Button>
												{notif.link && (
													<Button
														variant="ghost"
														size="icon"
														className="h-8 w-8 rounded-lg"
														title="Voir"
														asChild
													>
														<Link
															href={notif.link}
															onClick={() => markAsRead(notif.id)}
														>
															<ArrowRight size={14} />
														</Link>
													</Button>
												)}
											</div>
										</li>
									)
								})}
							</ul>
						)}
					</BentoCard>
				</div>
			</div>
		</>
	)
}
