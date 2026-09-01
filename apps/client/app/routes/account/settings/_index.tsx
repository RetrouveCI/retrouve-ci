import { Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { AppearanceSection } from './components/appearance-section'
import { PersonalInfoSection } from './components/personal-info-section'
import { NotificationsSection } from './components/notifications-section'
import { DangerZoneSection } from './components/danger-zone-section'
import { settingsAction } from './servers/settings.action'
import { settingsLoader } from './servers/settings.loader'
import type { Route } from './+types/_index'
import { pageMeta } from '@/shared/helpers/page-meta'

export function meta() {
	return pageMeta({
		title: 'Réglages',
		description:
			'Modifiez vos informations personnelles, votre mot de passe et le thème.',
	})
}

export const action = settingsAction
export const loader = settingsLoader

export default function SettingsPage({ loaderData }: Route.ComponentProps) {
	const { user } = loaderData

	return (
		<main className="flex-1">
			<section className="border-b">
				<div className="container mx-auto px-4 py-6">
					<Link
						to="/account"
						className="text-muted-foreground hover:text-foreground touch-target mb-4 inline-flex items-center gap-1.5 text-sm transition-colors"
					>
						<ArrowLeft className="h-4 w-4" />
						Retour au compte
					</Link>
					<h1 className="text-2xl font-bold">Réglages</h1>
				</div>
			</section>

			<section className="py-6">
				<div className="container mx-auto max-w-2xl space-y-7 px-4">
					<AppearanceSection />
					<NotificationsSection />
					<PersonalInfoSection user={user} />
					<DangerZoneSection />
				</div>
			</section>
		</main>
	)
}
