import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { Settings, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/shared/auth/auth-context'
import { authClient } from '@/shared/auth/auth-client'
import { PersonalInfoSection } from './components/personal-info-section'
import { NotificationsSection } from './components/notifications-section'
import { SecuritySection } from './components/security-section'
import { DangerZoneSection } from './components/danger-zone-section'

export default function ParametresPage() {
	const navigate = useNavigate()
	const { isAuthenticated, isLoading, user } = useAuth()

	const [notifications, setNotifications] = useState({
		whatsapp: true,
		email: false,
		stickerScans: true,
		matches: true,
	})

	useEffect(() => {
		if (!isLoading && !isAuthenticated) navigate('/auth')
	}, [isLoading, isAuthenticated, navigate])

	const handleNotificationChange = (key: keyof typeof notifications) => {
		setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
		toast.success('Préférences mises à jour')
	}

	const handleDeleteAccount = async (password: string) => {
		const { error } = await authClient.deleteUser({ password })
		if (error) {
			toast.error('Mot de passe incorrect')
			throw new Error(error.message)
		}

		toast.success('Votre compte a été supprimé')

		navigate('/')
	}

	if (isLoading) {
		return (
			<main className="flex flex-1 items-center justify-center">
				<div className="border-primary-green h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" />
			</main>
		)
	}

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
					<NotificationsSection
						notifications={notifications}
						onChange={handleNotificationChange}
					/>
					<SecuritySection />
					<DangerZoneSection onDeleteAccount={handleDeleteAccount} />
				</div>
			</section>
		</main>
	)
}
