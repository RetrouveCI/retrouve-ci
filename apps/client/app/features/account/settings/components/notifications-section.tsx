import { Badge, Switch } from '@retrouve-ci/ui/components'
import { Bell } from 'lucide-react'

const NOTIFICATION_ITEMS: {
	key: string
	label: string
	description: string
}[] = [
	{
		key: 'whatsapp',
		label: 'Notifications WhatsApp',
		description: 'Recevez des alertes directement sur WhatsApp',
	},
	{
		key: 'email',
		label: 'Notifications Email',
		description: 'Recevez un résumé par email',
	},
	{
		key: 'stickerScans',
		label: 'Scans de stickers',
		description: "Soyez alerté quand quelqu'un scanne vos stickers",
	},
	{
		key: 'matches',
		label: 'Correspondances trouvées',
		description: 'Alertes pour les objets correspondant à vos recherches',
	},
]

export function NotificationsSection() {
	return (
		<div className="bg-background overflow-hidden rounded-2xl border">
			<div className="bg-muted/30 border-b p-5">
				<h2 className="flex items-center gap-2 font-semibold">
					<Bell className="text-primary-green h-4 w-4" />
					Notifications
					<Badge variant="secondary">Bientôt disponible</Badge>
				</h2>
			</div>
			<div className="space-y-1 p-5">
				{NOTIFICATION_ITEMS.map((item, i) => (
					<div
						key={item.key}
						className={`flex items-center justify-between py-4 ${i > 0 ? 'border-t' : ''}`}
					>
						<div className="flex-1">
							<p className="text-sm font-medium">{item.label}</p>
							<p className="text-muted-foreground text-xs">
								{item.description}
							</p>
						</div>
						<Switch checked={false} disabled />
					</div>
				))}
			</div>
		</div>
	)
}
