import { Button } from '@retrouve-ci/ui/components'
import { Link, useLocation } from 'react-router'
import { Menu, User, LogOut, LogIn } from 'lucide-react'
import { MobileNav } from '@/shared/components/mobile-nav'
import { NotificationBell } from '@/features/notifications/components/notification-bell'
import { useAuth } from '@/shared/auth/auth-context'
import { useState, useEffect } from 'react'
import { cn } from '@retrouve-ci/ui/utils'
import { LogoRetrouveCI } from './logo-retrouveci'

const navLinks = [
	{ href: '/', label: 'Accueil' },
	{ href: '/posts', label: 'Annonces' },
	{ href: '/publish', label: 'Publier' },
	{ href: '/stickers', label: 'Stickers QR' },
]

export function Header() {
	const [mobileNavOpen, setMobileNavOpen] = useState(false)
	const [mounted, setMounted] = useState(false)
	const [scrolled, setScrolled] = useState(false)
	const { pathname } = useLocation()
	const { user, isAuthenticated, logout } = useAuth()

	useEffect(() => {
		setMounted(true)
		const handleScroll = () => setScrolled(window.scrollY > 10)
		window.addEventListener('scroll', handleScroll)
		return () => window.removeEventListener('scroll', handleScroll)
	}, [])

	return (
		<header
			className={cn(
				'sticky top-0 z-50 w-full transition-all duration-300',
				scrolled
					? 'bg-background/95 border-b shadow-sm backdrop-blur-md'
					: 'bg-background border-b',
			)}
		>
			<div className="container mx-auto flex h-16 items-center justify-between px-4">
				<Link to="/" className="group flex shrink-0 items-center gap-2.5">
					<LogoRetrouveCI />
				</Link>

				<nav className="hidden items-center md:flex">
					<div className="bg-muted/50 flex items-center gap-1 rounded-full p-1">
						{navLinks.map(link => (
							<Link
								key={link.href}
								to={link.href}
								className={cn(
									'rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
									pathname === link.href
										? 'bg-background text-foreground shadow-sm'
										: 'text-muted-foreground hover:text-foreground',
								)}
							>
								{link.label}
							</Link>
						))}
					</div>
				</nav>

				<div className="hidden items-center gap-2 md:flex">
					{isAuthenticated ? (
						<>
							<NotificationBell />
							<Button asChild variant="ghost" size="sm" className="h-9 gap-2">
								<Link to="/account">
									<div className="bg-primary-green/10 flex h-7 w-7 items-center justify-center rounded-full">
										<User className="text-primary-green h-4 w-4" />
									</div>
									<span className="max-w-25 truncate font-medium">
										{user?.name}
									</span>
								</Link>
							</Button>
							<Button
								variant="ghost"
								size="icon"
								onClick={logout}
								className="text-muted-foreground hover:text-destructive h-9 w-9"
								aria-label="Déconnexion"
							>
								<LogOut className="h-4 w-4" />
							</Button>
						</>
					) : (
						<Button
							asChild
							size="sm"
							className="bg-primary-green hover:bg-primary-green-dark h-9 rounded-full px-4 text-white"
						>
							<Link to="/auth/login" className="gap-2">
								<LogIn className="h-4 w-4" />
								Connexion
							</Link>
						</Button>
					)}
				</div>

				<Button
					variant="ghost"
					size="icon"
					className="h-9 w-9 md:hidden"
					onClick={() => setMobileNavOpen(true)}
					aria-label="Ouvrir le menu"
				>
					<Menu className="h-5 w-5" />
				</Button>
			</div>

			{mounted && (
				<MobileNav
					open={mobileNavOpen}
					onOpenChange={setMobileNavOpen}
					links={navLinks}
					currentPath={pathname}
				/>
			)}
		</header>
	)
}
