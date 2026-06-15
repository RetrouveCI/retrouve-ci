import { Link } from 'react-router'
import { Settings, ArrowLeft } from 'lucide-react'
import { PersonalInfoSection } from './components/personal-info-section'
import { NotificationsSection } from './components/notifications-section'
import { SecuritySection } from './components/security-section'
import { DangerZoneSection } from './components/danger-zone-section'
import { settingsAction } from './servers/settings.action'
import { settingsLoader } from './servers/settings.loader'
import type { Route } from './+types/index'

export const action = settingsAction
export const loader = settingsLoader

export default function ParametresPage({ loaderData }: Route.ComponentProps) {
	const { user } = loaderData

	return (
		<main className="flex-1">
			<section className="relative overflow-hidden border-b">
				<div className="pointer-events-none absolute inset-0">
					<div className="bg-muted/50 absolute -top-20 right-0 h-96 w-96 rounded-full blur-3xl" />
				</div>
				<div className="relative container mx-auto px-4 py-8">
					<Link
						to="/account"
						className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1.5 text-sm transition-colors"
					>
						<ArrowLeft className="h-4 w-4" />
						Retour au compte
					</Link>
					<div className="flex items-center gap-4">
						<div className="bg-muted flex h-14 w-14 items-center justify-center rounded-2xl">
							<Settings className="text-muted-foreground h-7 w-7" />
						</div>
						<div>
							<h1 className="text-2xl font-bold">Paramètres</h1>
							<p className="text-muted-foreground">
								Gérez votre compte et vos préférences
							</p>
						</div>
					</div>
				</div>
			</section>

			<section className="py-8">
				<div className="container mx-auto max-w-2xl space-y-6 px-4">
					<PersonalInfoSection user={user} />
					<NotificationsSection />
					<SecuritySection />
					<DangerZoneSection />
				</div>
			</section>
		</main>
	)
}
