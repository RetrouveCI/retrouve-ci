'use client'

import Link from 'next/link'
import {
	User,
	LogIn,
	LogOut,
	QrCode,
	FileText,
	Settings,
	Eye,
	ChevronRight,
	Smartphone,
	ArrowRight,
	Shield,
	Bell,
	Plus,
	Package,
} from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@repo/ui/lib/utils'

// Not logged in view
function NotLoggedInView() {
	return (
		<main className="flex flex-1 items-center justify-center py-16 md:py-24">
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-[var(--primary-green)]/5 blur-3xl" />
				<div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-[var(--accent-orange)]/5 blur-3xl" />
			</div>
			<div className="relative container mx-auto px-4">
				<div className="mx-auto max-w-md text-center">
					<div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--primary-green)]/10">
						<User className="h-10 w-10 text-[var(--primary-green)]" />
					</div>
					<h1 className="mb-3 text-2xl font-bold md:text-3xl">
						Connectez-vous
					</h1>
					<p className="text-muted-foreground mb-8">
						Accédez à votre compte pour gérer vos annonces et vos stickers QR.
					</p>
					<Button
						asChild
						size="lg"
						className="h-12 w-full rounded-xl bg-[var(--primary-green)] text-white hover:bg-[var(--primary-green-dark)]"
					>
						<Link href="/auth" className="gap-2">
							<LogIn className="h-5 w-5" />
							Se connecter
						</Link>
					</Button>
					<p className="text-muted-foreground mt-4 text-sm">
						Pas encore de compte ?{' '}
						<Link
							href="/auth"
							className="font-medium text-[var(--primary-green)] hover:underline"
						>
							Créer un compte
						</Link>
					</p>
				</div>
			</div>
		</main>
	)
}

// Dashboard View
function DashboardView() {
	const { user, logout, stickers, listings } = useAuth()

	const activeStickers = stickers.filter(s => s.isActive).length
	const activeListings = listings.filter(l => l.status === 'active').length
	const totalViews = listings.reduce((sum, l) => sum + l.views, 0)

	const menuItems = [
		{
			href: '/compte/stickers',
			icon: QrCode,
			label: 'Mes Stickers QR',
			description: 'Gérez vos stickers et protégez vos objets',
			stat: `${activeStickers} actif${activeStickers > 1 ? 's' : ''}`,
			color: 'primary-green',
			featured: true,
		},
		{
			href: '/compte/annonces',
			icon: FileText,
			label: 'Mes Annonces',
			description: 'Objets perdus et retrouvés',
			stat: `${activeListings} active${activeListings > 1 ? 's' : ''}`,
			color: 'accent-orange',
			featured: true,
		},
		{
			href: '/compte/commandes',
			icon: Package,
			label: 'Mes Commandes',
			description: 'Historique et suivi de vos commandes',
			stat: '3 commandes',
			color: 'primary-green',
			featured: true,
		},
		{
			href: '/compte/parametres',
			icon: Settings,
			label: 'Paramètres',
			description: 'Informations et notifications',
			color: 'muted-foreground',
			featured: false,
		},
	]

	return (
		<main className="flex-1">
			{/* Profile Header */}
			<section className="relative overflow-hidden border-b">
				<div className="pointer-events-none absolute inset-0">
					<div className="absolute -top-20 right-0 h-96 w-96 rounded-full bg-[var(--primary-green)]/5 blur-3xl" />
					<div className="absolute bottom-0 left-1/2 h-64 w-64 rounded-full bg-[var(--accent-orange)]/5 blur-3xl" />
				</div>
				<div className="relative container mx-auto px-4 py-10">
					<div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
						<div className="flex items-center gap-4">
							<div className="relative">
								<div className="flex h-18 w-18 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--primary-green)] to-[var(--primary-green-dark)] shadow-[var(--primary-green)]/20 shadow-lg">
									<User className="h-9 w-9 text-white" />
								</div>
								<div className="border-background absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full border-2 bg-[var(--primary-green)]">
									<div className="h-2 w-2 rounded-full bg-white" />
								</div>
							</div>
							<div>
								<p className="text-muted-foreground mb-0.5 text-sm">
									Bienvenue
								</p>
								<h1 className="text-2xl font-bold md:text-3xl">{user?.name}</h1>
								<p className="text-muted-foreground mt-1 flex items-center gap-1.5">
									<Smartphone className="h-4 w-4" />
									+225 {user?.phone}
								</p>
							</div>
						</div>
						<Button
							variant="outline"
							size="sm"
							onClick={logout}
							className="text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/10 gap-2 rounded-xl"
						>
							<LogOut className="h-4 w-4" />
							Déconnexion
						</Button>
					</div>
				</div>
			</section>

			{/* Stats */}
			<section className="py-6">
				<div className="container mx-auto px-4">
					<div className="grid grid-cols-2 gap-3 md:grid-cols-4">
						<div className="bg-background border-border/50 group rounded-2xl border p-4 transition-all hover:border-[var(--primary-green)]/40 hover:shadow-sm">
							<div className="mb-2 flex items-center justify-between">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-green)]/10 transition-transform group-hover:scale-110">
									<QrCode className="h-5 w-5 text-[var(--primary-green)]" />
								</div>
							</div>
							<p className="text-2xl font-bold md:text-3xl">
								{stickers.length}
							</p>
							<p className="text-muted-foreground text-xs">Stickers total</p>
						</div>
						<div className="bg-background border-border/50 group rounded-2xl border p-4 transition-all hover:border-[var(--primary-green)]/40 hover:shadow-sm">
							<div className="mb-2 flex items-center justify-between">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-green)]/10 transition-transform group-hover:scale-110">
									<Shield className="h-5 w-5 text-[var(--primary-green)]" />
								</div>
							</div>
							<p className="text-2xl font-bold md:text-3xl">{activeStickers}</p>
							<p className="text-muted-foreground text-xs">Stickers actifs</p>
						</div>
						<div className="bg-background border-border/50 group rounded-2xl border p-4 transition-all hover:border-[var(--accent-orange)]/40 hover:shadow-sm">
							<div className="mb-2 flex items-center justify-between">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-orange)]/10 transition-transform group-hover:scale-110">
									<FileText className="h-5 w-5 text-[var(--accent-orange)]" />
								</div>
							</div>
							<p className="text-2xl font-bold md:text-3xl">{activeListings}</p>
							<p className="text-muted-foreground text-xs">Annonces actives</p>
						</div>
						<div className="bg-background border-border/50 group rounded-2xl border p-4 transition-all hover:border-blue-400/40 hover:shadow-sm">
							<div className="mb-2 flex items-center justify-between">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 transition-transform group-hover:scale-110">
									<Eye className="h-5 w-5 text-blue-500" />
								</div>
							</div>
							<p className="text-2xl font-bold md:text-3xl">{totalViews}</p>
							<p className="text-muted-foreground text-xs">Vues totales</p>
						</div>
					</div>
				</div>
			</section>

			{/* Bento Navigation */}
			<section className="pb-12">
				<div className="container mx-auto px-4">
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{menuItems
							.filter(m => m.featured)
							.map(item => {
								const Icon = item.icon
								const colorVar = `var(--${item.color})`
								return (
									<Link
										key={item.href}
										href={item.href}
										className={cn(
											'group bg-background border-border/50 relative rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg',
											item.color === 'primary-green'
												? 'hover:border-[var(--primary-green)]/40'
												: 'hover:border-[var(--accent-orange)]/40',
										)}
									>
										<div
											className={cn(
												'absolute top-0 right-6 left-6 h-1 rounded-b-full transition-all duration-300 group-hover:right-4 group-hover:left-4',
												item.color === 'primary-green'
													? 'bg-[var(--primary-green)]'
													: 'bg-[var(--accent-orange)]',
											)}
										/>
										<div className="mt-2 flex items-start justify-between gap-4">
											<div className="flex-1">
												<div
													className={cn(
														'mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110',
														item.color === 'primary-green'
															? 'bg-[var(--primary-green)]/10'
															: 'bg-[var(--accent-orange)]/10',
													)}
												>
													<Icon
														className={cn(
															'h-6 w-6',
															item.color === 'primary-green'
																? 'text-[var(--primary-green)]'
																: 'text-[var(--accent-orange)]',
														)}
													/>
												</div>
												<h3 className="mb-1 text-xl font-bold">{item.label}</h3>
												<p className="text-muted-foreground mb-3 text-sm">
													{item.description}
												</p>
												{item.stat && (
													<span
														className={cn(
															'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
															item.color === 'primary-green'
																? 'bg-[var(--primary-green)]/10 text-[var(--primary-green)]'
																: 'bg-[var(--accent-orange)]/10 text-[var(--accent-orange)]',
														)}
													>
														<span className="h-1.5 w-1.5 rounded-full bg-current" />
														{item.stat}
													</span>
												)}
											</div>
											<ArrowRight className="text-muted-foreground group-hover:text-foreground mt-2 h-5 w-5 transition-all group-hover:translate-x-1" />
										</div>
									</Link>
								)
							})}
					</div>

					{/* Settings link - smaller */}
					<Link
						href="/compte/parametres"
						className="group bg-background border-border/50 hover:border-border mt-4 flex items-center justify-between gap-4 rounded-2xl border p-5 transition-all hover:shadow-md"
					>
						<div className="flex items-center gap-4">
							<div className="bg-muted flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-110">
								<Settings className="text-muted-foreground h-5 w-5" />
							</div>
							<div>
								<h3 className="font-semibold">Paramètres</h3>
								<p className="text-muted-foreground text-sm">
									Informations et notifications
								</p>
							</div>
						</div>
						<ChevronRight className="text-muted-foreground h-5 w-5 transition-transform group-hover:translate-x-1" />
					</Link>

					{/* Quick Actions */}
					<div className="mt-8 grid gap-3 sm:grid-cols-2">
						<Link
							href="/publier"
							className="group flex items-center gap-3 rounded-xl border-2 border-dashed border-[var(--accent-orange)]/30 bg-[var(--accent-orange)]/5 p-4 transition-all hover:border-[var(--accent-orange)]/50 hover:bg-[var(--accent-orange)]/10"
						>
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-orange)] transition-transform group-hover:scale-110">
								<Plus className="h-5 w-5 text-white" />
							</div>
							<div>
								<p className="text-sm font-semibold">Nouvelle annonce</p>
								<p className="text-muted-foreground text-xs">
									Objet perdu ou retrouvé
								</p>
							</div>
						</Link>
						<Link
							href="/stickers"
							className="group flex items-center gap-3 rounded-xl border-2 border-dashed border-[var(--primary-green)]/30 bg-[var(--primary-green)]/5 p-4 transition-all hover:border-[var(--primary-green)]/50 hover:bg-[var(--primary-green)]/10"
						>
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-green)] transition-transform group-hover:scale-110">
								<QrCode className="h-5 w-5 text-white" />
							</div>
							<div>
								<p className="text-sm font-semibold">Commander des stickers</p>
								<p className="text-muted-foreground text-xs">
									Protégez vos objets
								</p>
							</div>
						</Link>
					</div>
				</div>
			</section>
		</main>
	)
}

export default function ComptePage() {
	const { isAuthenticated, isLoading } = useAuth()

	if (isLoading) {
		return (
			<>
				<Header />
				<main className="flex flex-1 items-center justify-center">
					<div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--primary-green)] border-t-transparent" />
				</main>
				<Footer />
			</>
		)
	}

	return (
		<>
			<Header />
			{isAuthenticated ? <DashboardView /> : <NotLoggedInView />}
			<Footer />
		</>
	)
}
