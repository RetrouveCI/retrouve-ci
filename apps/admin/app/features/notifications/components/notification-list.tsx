import { Link } from 'react-router'
import { Button, Badge } from '@retrouve-ci/ui/components'
import { cn } from '@retrouve-ci/ui/utils'
import { BellOff, Check, ArrowRight, Sparkles } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Notification } from '../notifications.types'

interface NotificationListProps {
	notifications: Notification[]
	onMarkAsRead: (id: string) => void
}

export function NotificationList({
	notifications,
	onMarkAsRead,
}: NotificationListProps) {
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
			{notifications.map((notif) => (
				<li
					key={notif.id}
					className={cn(
						'group relative flex items-start gap-4 px-5 py-4 transition-colors',
						!notif.read && 'bg-primary/3',
					)}
				>
					{!notif.read && (
						<span className="bg-primary absolute top-1/2 left-2 h-1.5 w-1.5 -translate-y-1/2 rounded-full" />
					)}

					<div className="bg-primary/10 mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
						<Sparkles className="text-primary h-5 w-5" />
					</div>

					<div className="min-w-0 flex-1">
						<div className="mb-0.5 flex flex-wrap items-center gap-2">
							<span className="text-sm font-semibold">{notif.title}</span>
							<span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
								Correspondance
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
							{format(new Date(notif.createdAt), "d MMMM yyyy 'à' HH:mm", {
								locale: fr,
							})}
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
						{notif.link && (
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 rounded-lg"
								title="Voir"
								asChild
							>
								<Link
									to={notif.link}
									onClick={() => {
										if (!notif.read) onMarkAsRead(notif.id)
									}}
								>
									<ArrowRight size={14} />
								</Link>
							</Button>
						)}
					</div>
				</li>
			))}
		</ul>
	)
}
