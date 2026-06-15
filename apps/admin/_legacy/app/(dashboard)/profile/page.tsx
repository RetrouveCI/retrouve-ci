'use client'

import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '@retrouve-ci/ui/components'
import { useAuth } from '@/lib/auth-context'
import { TopBar } from '@/components/topbar'
import { ProfileIdentityCard } from './components/ProfileIdentityCard'
import { PermissionsCard } from './components/PermissionsCard'
import { PasswordChangeForm } from './components/PasswordChangeForm'
import { ActiveSessionsCard } from './components/ActiveSessionsCard'

const profileData = {
	phone: '+225 07 00 00 00 00',
	role: 'super_admin' as const,
	createdAt: '2023-06-01T00:00:00Z',
	lastLogin: '2024-04-07T08:30:00Z',
}

const permissions = [
	{ label: 'Gérer les utilisateurs', allowed: true },
	{ label: 'Gérer les QR codes', allowed: true },
	{ label: 'Modérer les posts', allowed: true },
	{ label: 'Consulter les événements', allowed: true },
	{
		label: 'Gérer les administrateurs',
		allowed: profileData.role === 'super_admin',
	},
	{
		label: 'Accès aux paramètres système',
		allowed: profileData.role === 'super_admin',
	},
]

export default function ProfilePage() {
	const { user } = useAuth()

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
									name={user?.name}
									email={user?.email}
									phone={profileData.phone}
									role={profileData.role}
									createdAt={profileData.createdAt}
									lastLogin={profileData.lastLogin}
								/>
								<PermissionsCard permissions={permissions} />
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
