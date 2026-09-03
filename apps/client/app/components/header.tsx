import { Button } from '@app/ui/components'
import { Link, useLocation } from 'react-router'
import { LogIn } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserMenu } from '@/components/user-menu'
import { SearchBar } from '@/components/search-bar'
import { NotificationBell } from '@/routes/notifications/components/notification-bell'
import { useAuth } from '@/context/auth'
import { useState, useEffect } from 'react'
import { cn } from '@app/ui/utils'
import { LogoRetrouveCI } from './logo-retrouveci'

/**
 * « Accueil » is not among them: the logo already leads there, and a link that
 * repeats the mark beside it spends a slot for nothing.
 */
const navLinks = [
	{ href: '/posts', label: 'Annonces' },
	{ href: '/stickers', label: 'Stickers' },
]

function isActivePath(pathname: string, href: string) {
	if (href === '/') return pathname === '/'
	return pathname === href || pathname.startsWith(`${href}/`)
}

/**
 * Three zones rather than `justify-between`. The problem was never the styling:
 * `justify-between` in a 1600 px container leaves a gap between the navigation
 * and the actions that **grows with the screen**, given to nothing. The search
 * takes it — and search had no home in the header at all before.
 *
 * Identity and links sit left, the search takes the middle at `flex-1` under a
 * ceiling, the actions sit right. On scroll the links fade and the search stays:
 * it is what someone returning to the top is reaching for.
 */
export function Header() {
	const [scrolled, setScrolled] = useState(false)
	const { pathname } = useLocation()
	const { user, isAuthenticated, logout } = useAuth()

	useEffect(() => {
		const handleScroll = () => setScrolled(window.scrollY > 10)
		window.addEventListener('scroll', handleScroll)
		return () => window.removeEventListener('scroll', handleScroll)
	}, [])

	return (
		<header
			className={cn(
				'safe-x sticky top-0 z-50 w-full transition-all duration-300',
				scrolled
					? 'bg-background/95 border-b shadow-sm backdrop-blur-md'
					: 'bg-background border-b',
			)}
		>
			<div
				className={cn(
					'mx-auto flex w-full max-w-400 items-center gap-4 px-6 transition-[height] duration-300 md:gap-5 lg:gap-4 lg:px-6 xl:gap-7 xl:px-10',
					scrolled ? 'h-16 lg:h-[58px]' : 'h-16 lg:h-19',
				)}
			>
				<div className="flex shrink-0 items-center gap-5 xl:gap-7">
					<Link to="/" className="touch-target group flex items-center gap-2.5">
						<LogoRetrouveCI />
					</Link>

					{/* The links are what the scrolled bar gives up to keep the search. */}
					{!scrolled && (
						<nav className="hidden items-center gap-4 lg:flex xl:gap-6">
							{navLinks.map(link => {
								const active = isActivePath(pathname, link.href)
								return (
									<Link
										key={link.href}
										to={link.href}
										className={cn(
											'border-b-2 pb-0.5 text-base whitespace-nowrap transition-colors',
											active
												? 'border-primary-green text-foreground font-semibold'
												: 'text-muted-foreground hover:text-foreground border-transparent',
										)}
									>
										{link.label}
									</Link>
								)
							})}
						</nav>
					)}
				</div>

				{/**
				 * The middle zone. It absorbs the free space rather than leaving it
				 * between the two others, and stops at a ceiling so a 1920 px screen
				 * does not stretch one field across half the page.
				 */}
				<div className="hidden min-w-0 flex-1 md:block lg:max-w-155 lg:min-w-80">
					<SearchBar
						mode="navigate"
						action="/posts"
						submit="icon"
						size={scrolled ? 'xs' : 'sm'}
						placeholder="Téléphone, clés, papiers, sac…"
						className="border"
					/>
				</div>

				<div className="ml-auto flex shrink-0 items-center gap-2">
					<ThemeToggle className="hidden h-9 w-9 rounded-full xl:inline-flex" />

					{/**
					 * Two targets, not a menu that hides them. The same words as the hero
					 * and the form (§2.3, rule 3), and dark ink on the orange flat — white
					 * on it reads 2.70:1, which §2.1 forbids.
					 */}
					<div className="border-accent-orange hidden h-11 items-center overflow-hidden rounded-full border-[1.5px] lg:flex">
						<Link
							to="/publish/lost"
							className="bg-accent-orange text-accent-orange-foreground flex h-full items-center px-3 text-sm font-semibold whitespace-nowrap xl:px-4"
						>
							J&apos;ai perdu
						</Link>
						<Link
							to="/publish/found"
							className="text-accent-orange-text hover:bg-accent-orange/10 flex h-full items-center px-3 text-sm font-semibold whitespace-nowrap transition-colors xl:px-4"
						>
							J&apos;ai trouvé
						</Link>
					</div>

					{isAuthenticated ? (
						<div className="bg-muted/50 flex items-center gap-1 rounded-full p-1">
							<NotificationBell />
							<div className="bg-border hidden h-5 w-px lg:block" />
							<div className="hidden lg:block">
								<UserMenu
									name={user?.name ?? ''}
									phone={user?.phone}
									onLogout={logout}
								/>
							</div>
						</div>
					) : (
						<Button
							asChild
							size="sm"
							variant="outline"
							className="hidden h-11 rounded-full px-4 lg:inline-flex lg:h-9"
						>
							<Link to="/login" className="gap-2">
								<LogIn className="h-4 w-4" />
								Connexion
							</Link>
						</Button>
					)}
				</div>
			</div>
		</header>
	)
}
