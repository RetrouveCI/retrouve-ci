import { Badge, Switch } from '@app/ui/components'

/**
 * The artboard draws both switches **on**. Nothing backs them: `User` carries
 * no preference column and the API exposes no endpoint, so a switch that moved
 * would promise a setting no one stores. They stay off and disabled until
 * there is something to save.
 */
const ALERTS = [
	{
		key: 'matches',
		label: 'Objets qui correspondent',
		description: "Quand un objet trouvé ressemble à l'un des vôtres.",
	},
	{
		key: 'scans',
		label: 'Scans de mes stickers',
		description: "Quand quelqu'un scanne un de vos QR codes.",
	},
]

export function NotificationsSection() {
	return (
		<section className="space-y-2">
			<h2 className="flex items-center gap-2 text-lg font-bold tracking-tight">
				Alertes
				<Badge variant="secondary" className="font-medium">
					Bientôt disponible
				</Badge>
			</h2>

			<div className="space-y-2">
				{ALERTS.map(alert => (
					<div
						key={alert.key}
						className="bg-background flex items-center gap-3.5 rounded-2xl border p-4"
					>
						<div className="flex-1">
							<p className="text-sm font-semibold">{alert.label}</p>
							<p className="text-muted-foreground mt-0.5 text-xs">
								{alert.description}
							</p>
						</div>
						<Switch
							checked={false}
							disabled
							aria-label={alert.label}
							className="shrink-0"
						/>
					</div>
				))}
			</div>
		</section>
	)
}
