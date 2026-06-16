import { Tabs, TabsContent, TabsList, TabsTrigger } from '@retrouve-ci/ui/components'
import { TopBar } from '@/shared/components/topbar'
import { ProfileIdentityCard } from './components/profile-identity-card'
import { PermissionsCard } from './components/permissions-card'
import { PasswordChangeForm } from './components/password-change-form'
import { ActiveSessionsCard } from './components/active-sessions-card'
import { profileLoader } from './servers/profile.loader'
import type { Route } from './+types/index'

export const loader = profileLoader

export default function ProfilePage({ loaderData }: Route.ComponentProps) {
	const { user } = loaderData

	return (
		<>
			<TopBar title="Mon profil" />
			<div className="pt-16">
				<div className="p-4 lg:p-6">
					<Tabs defaultValue="info">
						<TabsList className="mb-6">
							<TabsTrigger value="info">Informations</TabsTrigger>
							<TabsTrigger value="security">Sécurité</TabsTrigger>
						</TabsList>

						<TabsContent value="info">
							<div className="grid gap-4 lg:grid-cols-3">
								<ProfileIdentityCard
									name={user.name}
									email={user.email}
									role={user.role}
								/>
								<PermissionsCard role={user.role} />
							</div>
						</TabsContent>

						<TabsContent value="security">
							<div className="grid gap-4 lg:grid-cols-3">
								<PasswordChangeForm />
								<ActiveSessionsCard />
							</div>
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</>
	)
}
