'use client'

import { Button } from '@retrouve-ci/ui/components'
import Link from 'next/link'
import { User, LogIn } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProfileHeader } from '@/components/compte/profile-header'
import { AccountStats } from '@/components/compte/account-stats'
import { AccountNav } from '@/components/compte/account-nav'
import { useAuth } from '@/contexts/auth-context'

function NotLoggedInView() {
	return (
		<main className="flex flex-1 items-center justify-center py-16 md:py-24">
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary-green/5 blur-3xl" />
				<div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent-orange/5 blur-3xl" />
			</div>
			<div className="relative container mx-auto px-4">
				<div className="mx-auto max-w-md text-center">
					<div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-green/10">
						<User className="h-10 w-10 text-primary-green" />
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
						className="h-12 w-full rounded-xl bg-primary-green text-white hover:bg-primary-green-dark"
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
							className="font-medium text-primary-green hover:underline"
						>
							Créer un compte
						</Link>
					</p>
				</div>
			</div>
		</main>
	)
}

function DashboardView() {
	const { user, logout, stickers, listings } = useAuth()

	if (!user) return null

	return (
		<main className="flex-1">
			<ProfileHeader user={user} onLogout={logout} />
			<AccountStats stickers={stickers} listings={listings} />
			<AccountNav stickers={stickers} listings={listings} />
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
					<div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-green border-t-transparent" />
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
