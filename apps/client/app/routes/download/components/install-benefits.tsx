import { Home, QrCode, WifiOff } from 'lucide-react'

/**
 * Three claims, each one already shipped: the manifest's shortcuts (R23) and
 * the worker's cache of what has been read (R24). The artboard also promised an
 * alert with the app closed — there is no web push in this repo, and none
 * planned, so that card names the shortcut instead (§ R25).
 */
const BENEFITS = [
	{
		icon: Home,
		title: 'Ouverture immédiate',
		body: "L'icône verte sur l'écran d'accueil, sans passer par le navigateur.",
	},
	{
		icon: WifiOff,
		title: 'Lisible sans réseau',
		body: 'Les annonces déjà consultées restent consultables.',
	},
	{
		icon: QrCode,
		title: 'Scanner plus vite',
		body: 'Un raccourci direct vers le scanner et la publication.',
	},
]

export function InstallBenefits() {
	return (
		<section className="space-y-3 px-5 py-5">
			<h2 className="text-xl font-bold tracking-tight">Ce que ça change</h2>
			<ul className="space-y-2.5">
				{BENEFITS.map(({ icon: Icon, title, body }) => (
					<li
						key={title}
						className="flex items-center gap-3.5 rounded-[14px] border p-3.5"
					>
						<Icon className="text-primary-green-text h-5.5 w-5.5 shrink-0" />
						<div className="min-w-0">
							<p className="text-base font-semibold">{title}</p>
							<p className="text-muted-foreground text-xs">{body}</p>
						</div>
					</li>
				))}
			</ul>
		</section>
	)
}
