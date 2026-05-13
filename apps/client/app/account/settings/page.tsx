'use client'

import Link from 'next/link'
import { Settings, ArrowLeft } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useAuth } from '@/contexts/auth-context'
import { redirect } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { PersonalInfoSection } from './components/PersonalInfoSection'
import { NotificationsSection } from './components/NotificationsSection'
import { SecuritySection } from './components/SecuritySection'
import { DangerZoneSection } from './components/DangerZoneSection'

export default function ParametresPage() {
	const { isAuthenticated, isLoading, user, logout } = useAuth()
	const [notifications, setNotifications] = useState({
		whatsapp: true,
		email: false,
		stickerScans: true,
		matches: true,
	})

	if (!isLoading && !isAuthenticated) {
		redirect('/auth')
	}

	const handleNotificationChange = (key: keyof typeof notifications) => {
		setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
		toast.success('Préférences mises à jour')
	}

	if (isLoading) {
		return (
			<>
				<Header />
				<main className="flex flex-1 items-center justify-center">
					<div className="border-primary-green h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" />
				</main>
				<Footer />
			</>
		)
	}

	return (
		<>
			<Header />
			<main className="flex-1">
				<section className="relative overflow-hidden border-b">
					<div className="pointer-events-none absolute inset-0">
						<div className="bg-muted/50 absolute -top-20 right-0 h-96 w-96 rounded-full blur-3xl" />
					</div>
					<div className="relative container mx-auto px-4 py-8">
						<Link
							href="/account"
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
						<DangerZoneSection onDeleteAccount={logout} />
					</div>
				</section>
			</main>
			<Footer />
		</>
	)
}
