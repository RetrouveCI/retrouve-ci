import { Outlet, redirect } from 'react-router'
import { ShieldCheck, ScanLine, BellRing } from 'lucide-react'
import { getServerSession } from '@/shared/auth/auth.server'
import type { Route } from './+types/layout'

export async function loader({ request }: Route.LoaderArgs) {
	const session = await getServerSession(request)
	if (session?.user.role === 'admin') {
		throw redirect('/')
	}
	return null
}

const highlights = [
	{
		icon: ShieldCheck,
		title: 'Modération centralisée',
		description: 'Posts, commandes et signalements au même endroit.',
	},
	{
		icon: ScanLine,
		title: 'Suivi des QR codes',
		description: 'Génération, activation et historique des scans.',
	},
	{
		icon: BellRing,
		title: 'Alertes en temps réel',
		description: 'Notifications et messages de contact instantanés.',
	},
]

export default function AuthLayout() {
	return (
		<div className="bg-background grid min-h-screen lg:grid-cols-2">
			<aside className="bg-primary text-primary-foreground relative hidden flex-col justify-between p-12 lg:flex">
				<div className="flex items-center gap-3">
					<img
						src="/logo.png"
						alt="RetrouveCI"
						width={40}
						height={40}
						className="h-10 w-10 rounded-xl"
					/>
					<span className="text-lg font-semibold tracking-tight">
						RetrouveCI
					</span>
				</div>

				<div className="max-w-md space-y-8">
					<div className="space-y-3">
						<h2 className="text-3xl font-semibold tracking-tight">
							Backoffice RetrouveCI
						</h2>
						<p className="text-primary-foreground/80 text-base">
							Pilotez la plateforme objets perdus &amp; trouvés de Côte
							d&apos;Ivoire depuis une console unique.
						</p>
					</div>

					<ul className="space-y-5">
						{highlights.map(item => {
							const Icon = item.icon
							return (
								<li key={item.title} className="flex items-start gap-4">
									<span className="bg-primary-foreground/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
										<Icon className="h-5 w-5" />
									</span>
									<div className="space-y-0.5">
										<p className="font-medium">{item.title}</p>
										<p className="text-primary-foreground/70 text-sm">
											{item.description}
										</p>
									</div>
								</li>
							)
						})}
					</ul>
				</div>

				<p className="text-primary-foreground/60 text-sm">
					© {new Date().getFullYear()} RetrouveCI · Administration
				</p>
			</aside>

			<main className="bg-surface-muted flex items-center justify-center p-6 sm:p-10">
				<Outlet />
			</main>
		</div>
	)
}
