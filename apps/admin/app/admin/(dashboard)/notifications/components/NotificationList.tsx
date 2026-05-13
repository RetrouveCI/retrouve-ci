import { Button, Badge } from '@retrouve-ci/ui/components'
import Link from 'next/link'
import { BellOff, Check, Trash2, ArrowRight, Package, Users, FileText, QrCode, Settings } from 'lucide-react'
import { cn } from '@retrouve-ci/ui/utils'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Notification } from '@/domain/entities/notification'

const typeConfig: Record<
	Notification['type'],
	{ label: string; icon: React.ElementType; iconColor: string; iconBg: string; badgeClass: string }
> = {
	order: { label: 'Commande', icon: Package, iconColor: 'text-orange-600', iconBg: 'bg-orange-100', badgeClass: 'bg-orange-100 text-orange-700' },
	user: { label: 'Utilisateur', icon: Users, iconColor: 'text-blue-600', iconBg: 'bg-blue-100', badgeClass: 'bg-blue-100 text-blue-700' },
	post: { label: 'Post', icon: FileText, iconColor: 'text-purple-600', iconBg: 'bg-purple-100', badgeClass: 'bg-purple-100 text-purple-700' },
	qr: { label: 'QR Code', icon: QrCode, iconColor: 'text-primary', iconBg: 'bg-primary/10', badgeClass: 'bg-primary/10 text-primary' },
	system: { label: 'Système', icon: Settings, iconColor: 'text-gray-600', iconBg: 'bg-gray-100', badgeClass: 'bg-gray-100 text-gray-700' },
}

interface NotificationListProps {
	notifications: Notification[]
	onMarkAsRead: (id: string) => void
	onRemove: (id: string) => void
}

export function NotificationList({ notifications, onMarkAsRead, onRemove }: NotificationListProps) {
	if (notifications.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
				<div className="bg-muted flex h-14 w-14 items-center justify-center rounded-2xl">
					<BellOff className="text-muted-foreground h-7 w-7" />
				</div>
				<p className="font-semibold">Aucune notification</p>
				<p className="text-muted-foreground text-sm">
					Aucune notification ne correspond aux filtres sélectionnés.
				</p>
			</div>
		)
	}

	return (
		<ul className="divide-y">
			{notifications.map(notif => {
				const cfg = typeConfig[notif.type]
				const Icon = cfg.icon
				return (
					<li
						key={notif.id}
						className={cn(
							'group relative flex items-start gap-4 px-5 py-4 transition-colors',
							!notif.read && 'bg-primary/[0.03]',
							notif.link && 'hover:bg-muted/50',
						)}
					>
						{!notif.read && (
							<span className="bg-primary absolute top-1/2 left-2 h-1.5 w-1.5 -translate-y-1/2 rounded-full" />
						)}

						<div className={cn('mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', cfg.iconBg)}>
							<Icon className={cn('h-5 w-5', cfg.iconColor)} />
						</div>

						<div className="min-w-0 flex-1">
							<div className="mb-0.5 flex flex-wrap items-center gap-2">
								<span className="text-sm font-semibold">{notif.title}</span>
								<span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase', cfg.badgeClass)}>
									{cfg.label}
								</span>
								{!notif.read && (
									<Badge className="bg-primary/10 text-primary h-4 rounded-full px-1.5 text-[9px] font-bold">
										NOUVEAU
									</Badge>
								)}
							</div>
							<p className="text-muted-foreground text-sm leading-snug">{notif.message}</p>
							<p className="text-muted-foreground/70 mt-1 text-xs">
								{format(new Date(notif.createdAt), 'd MMMM yyyy à HH:mm', { locale: fr })}
							</p>
						</div>

						<div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
							{!notif.read && (
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 rounded-lg"
									title="Marquer comme lu"
									onClick={() => onMarkAsRead(notif.id)}
								>
									<Check size={14} />
								</Button>
							)}
							<Button
								variant="ghost"
								size="icon"
								className="text-muted-foreground hover:text-destructive h-8 w-8 rounded-lg"
								title="Supprimer"
								onClick={() => onRemove(notif.id)}
							>
								<Trash2 size={14} />
							</Button>
							{notif.link && (
								<Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" title="Voir" asChild>
									<Link href={notif.link} onClick={() => onMarkAsRead(notif.id)}>
										<ArrowRight size={14} />
									</Link>
								</Button>
							)}
						</div>
					</li>
				)
			})}
		</ul>
	)
}
