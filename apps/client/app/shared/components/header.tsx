import {
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@retrouve-ci/ui/components'
import { Link, useLocation } from 'react-router'
import { Menu, LogIn, Plus, ChevronDown } from 'lucide-react'
import { MobileNav } from '@/shared/components/mobile-nav'
import { SearchBar } from '@/shared/components/search-bar'
import { ThemeToggle } from '@/shared/components/theme-toggle'
import { UserMenu } from '@/shared/components/user-menu'
import { NotificationBell } from '@/features/notifications/components/notification-bell'
import { useAuth } from '@/shared/auth/auth-context'
import { useState, useEffect } from 'react'
import { cn } from '@retrouve-ci/ui/utils'
import { LogoRetrouveCI } from './logo-retrouveci'

const navLinks = [
	{ href: '/', label: 'Accueil' },
	{ href: '/posts', label: 'Annonces' },
	// Stickers on stand-by until we have a reliable printer/logistics partner
	// { href: '/stickers', label: 'Stickers QR' },
]

function isActivePath(pathname: string, href: string) {
	if (href === '/') return pathname === '/'
	return pathname === href || pathname.startsWith(`${href}/`)
}

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
			<div className="mx-auto flex h-16 w-full max-w-400 items-center justify-between gap-6 px-6 lg:px-10">
				<Link to="/" className="group flex shrink-0 items-center gap-2.5">
					<LogoRetrouveCI />
				</Link>

				<nav className="hidden shrink-0 items-center md:flex">
					<div className="bg-muted/50 flex items-center gap-1 rounded-full p-1">
						{navLinks.map(link => (
							<Link
								key={link.href}
								to={link.href}
								className={cn(
									'rounded-full px-6 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200',
									isActivePath(pathname, link.href)
										? 'bg-background text-foreground shadow-sm'
										: 'text-muted-foreground hover:text-foreground',
								)}
							>
								{link.label}
							</Link>
						))}
					</div>
				</nav>

				<div className="hidden min-w-0 grow shrink-0 md:flex md:w-md">
					<SearchBar
						mode="navigate"
						action="/posts"
						size="xs"
						showSubmit={false}
						placeholder="Rechercher un objet..."
						className="w-full max-w-2xl"
					/>
				</div>

				<div className="flex shrink-0 items-center gap-1.5">
					<ThemeToggle className="hidden h-9 w-9 rounded-full md:inline-flex" />

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								size="sm"
								className="bg-primary-green hover:bg-primary-green-dark hidden h-9 gap-1.5 rounded-full px-4 text-white md:inline-flex"
							>
								<Plus className="h-4 w-4" />
								Publier
								<ChevronDown className="h-3.5 w-3.5 opacity-80" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-48">
							<DropdownMenuItem asChild>
								<Link to="/publish/lost">Objet perdu</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link to="/publish/found">Objet trouvé</Link>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>

					{isAuthenticated ? (
						<div className="bg-muted/50 hidden items-center gap-1 rounded-full p-1 md:flex">
							<NotificationBell />
							<div className="bg-border h-5 w-px" />
							<UserMenu
								name={user?.name ?? ''}
								phone={user?.phone}
								onLogout={logout}
							/>
						</div>
					) : (
						<Button
							asChild
							size="sm"
							variant="outline"
							className="hidden h-9 rounded-full px-4 md:inline-flex"
						>
							<Link to="/auth/login" className="gap-2">
								<LogIn className="h-4 w-4" />
								Connexion
							</Link>
						</Button>
					)}

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
			</div>

			{mounted && (
				<MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />
			)}
		</header>
	)
}
