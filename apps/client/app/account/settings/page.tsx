'use client'

import { Button, Label, Switch, AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@retrouve-ci/ui/components'
import Link from 'next/link'
import {
	Settings,
	User,
	Bell,
	Shield,
	Trash2,
	ArrowLeft,
	Smartphone,
	Mail,
	Calendar,
	Check,
} from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useAuth } from '@/contexts/auth-context'
import { redirect } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

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
				{/* Header */}
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

				{/* Content */}
				<section className="py-8">
					<div className="container mx-auto max-w-2xl space-y-6 px-4">
						{/* Personal Info */}
						<div className="bg-background overflow-hidden rounded-2xl border">
							<div className="bg-muted/30 border-b p-5">
								<h2 className="flex items-center gap-2 font-semibold">
									<User className="text-primary-green h-4 w-4" />
									Informations personnelles
								</h2>
							</div>
							<div className="space-y-4 p-5">
								<div className="flex items-center justify-between py-3">
									<div className="flex items-center gap-3">
										<div className="bg-muted flex h-10 w-10 items-center justify-center rounded-xl">
											<User className="text-muted-foreground h-5 w-5" />
										</div>
										<div>
											<Label className="text-sm font-medium">Nom complet</Label>
											<p className="text-muted-foreground text-sm">
												{user?.name}
											</p>
										</div>
									</div>
								</div>
								<div className="flex items-center justify-between border-t py-3">
									<div className="flex items-center gap-3">
										<div className="bg-muted flex h-10 w-10 items-center justify-center rounded-xl">
											<Smartphone className="text-muted-foreground h-5 w-5" />
										</div>
										<div>
											<Label className="text-sm font-medium">Téléphone</Label>
											<p className="text-muted-foreground text-sm">
												+225 {user?.phone}
											</p>
										</div>
									</div>
									<span className="bg-primary-green/10 text-primary-green flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium">
										<Check className="h-3 w-3" />
										Vérifié
									</span>
								</div>
								<div className="flex items-center justify-between border-t py-3">
									<div className="flex items-center gap-3">
										<div className="bg-muted flex h-10 w-10 items-center justify-center rounded-xl">
											<Mail className="text-muted-foreground h-5 w-5" />
										</div>
										<div>
											<Label className="text-sm font-medium">Email</Label>
											<p className="text-muted-foreground text-sm">
												{user?.email || 'Non renseigné'}
											</p>
										</div>
									</div>
									<Button
										variant="ghost"
										size="sm"
										className="rounded-lg text-xs"
									>
										Modifier
									</Button>
								</div>
								<div className="flex items-center justify-between border-t py-3">
									<div className="flex items-center gap-3">
										<div className="bg-muted flex h-10 w-10 items-center justify-center rounded-xl">
											<Calendar className="text-muted-foreground h-5 w-5" />
										</div>
										<div>
											<Label className="text-sm font-medium">
												Membre depuis
											</Label>
											<p className="text-muted-foreground text-sm">
												{user?.createdAt}
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Notifications */}
						<div className="bg-background overflow-hidden rounded-2xl border">
							<div className="bg-muted/30 border-b p-5">
								<h2 className="flex items-center gap-2 font-semibold">
									<Bell className="text-primary-green h-4 w-4" />
									Notifications
								</h2>
							</div>
							<div className="space-y-1 p-5">
								<div className="flex items-center justify-between py-4">
									<div className="flex-1">
										<p className="text-sm font-medium">
											Notifications WhatsApp
										</p>
										<p className="text-muted-foreground text-xs">
											Recevez des alertes directement sur WhatsApp
										</p>
									</div>
									<Switch
										checked={notifications.whatsapp}
										onCheckedChange={() => handleNotificationChange('whatsapp')}
									/>
								</div>
								<div className="flex items-center justify-between border-t py-4">
									<div className="flex-1">
										<p className="text-sm font-medium">Notifications Email</p>
										<p className="text-muted-foreground text-xs">
											Recevez un résumé par email
										</p>
									</div>
									<Switch
										checked={notifications.email}
										onCheckedChange={() => handleNotificationChange('email')}
									/>
								</div>
								<div className="flex items-center justify-between border-t py-4">
									<div className="flex-1">
										<p className="text-sm font-medium">Scans de stickers</p>
										<p className="text-muted-foreground text-xs">
											Soyez alerté quand quelqu&apos;un scanne vos stickers
										</p>
									</div>
									<Switch
										checked={notifications.stickerScans}
										onCheckedChange={() =>
											handleNotificationChange('stickerScans')
										}
									/>
								</div>
								<div className="flex items-center justify-between border-t py-4">
									<div className="flex-1">
										<p className="text-sm font-medium">
											Correspondances trouvées
										</p>
										<p className="text-muted-foreground text-xs">
											Alertes pour les objets correspondant à vos recherches
										</p>
									</div>
									<Switch
										checked={notifications.matches}
										onCheckedChange={() => handleNotificationChange('matches')}
									/>
								</div>
							</div>
						</div>

						{/* Security */}
						<div className="bg-background overflow-hidden rounded-2xl border">
							<div className="bg-muted/30 border-b p-5">
								<h2 className="flex items-center gap-2 font-semibold">
									<Shield className="text-primary-green h-4 w-4" />
									Sécurité
								</h2>
							</div>
							<div className="space-y-4 p-5">
								<div className="flex items-center justify-between py-3">
									<div>
										<p className="text-sm font-medium">Changer le code PIN</p>
										<p className="text-muted-foreground text-xs">
											Modifiez votre code de connexion
										</p>
									</div>
									<Button variant="outline" size="sm" className="rounded-xl">
										Modifier
									</Button>
								</div>
								<div className="flex items-center justify-between border-t py-3">
									<div>
										<p className="text-sm font-medium">Sessions actives</p>
										<p className="text-muted-foreground text-xs">
											Gérez vos appareils connectés
										</p>
									</div>
									<Button variant="outline" size="sm" className="rounded-xl">
										Voir
									</Button>
								</div>
							</div>
						</div>

						{/* Danger Zone */}
						<div className="border-destructive/20 bg-destructive/5 overflow-hidden rounded-2xl border">
							<div className="border-destructive/20 bg-destructive/10 border-b p-5">
								<h2 className="text-destructive flex items-center gap-2 font-semibold">
									<Trash2 className="h-4 w-4" />
									Zone de danger
								</h2>
							</div>
							<div className="space-y-4 p-5">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium">Supprimer mon compte</p>
										<p className="text-muted-foreground text-xs">
											Cette action est irréversible et supprimera toutes vos
											données.
										</p>
									</div>
									<AlertDialog>
										<AlertDialogTrigger asChild>
											<Button
												variant="destructive"
												size="sm"
												className="rounded-xl"
											>
												Supprimer
											</Button>
										</AlertDialogTrigger>
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
												<AlertDialogDescription>
													Cette action supprimera définitivement votre compte,
													vos annonces et vos stickers. Cette action est
													irréversible.
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel className="rounded-xl">
													Annuler
												</AlertDialogCancel>
												<AlertDialogAction
													onClick={logout}
													className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
												>
													Supprimer mon compte
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								</div>
							</div>
						</div>
					</div>
				</section>
			</main>
			<Footer />
		</>
	)
}
