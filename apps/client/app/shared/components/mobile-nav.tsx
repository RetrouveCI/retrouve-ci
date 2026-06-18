import {
	Button,
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from '@retrouve-ci/ui/components'
import { Link } from 'react-router'
import {
	Home,
	Newspaper,
	PlusCircle,
	QrCode,
	LogIn,
	LogOut,
	User,
	ChevronRight,
	Plus,
	Moon,
	Sun,
} from 'lucide-react'
import { cn } from '@retrouve-ci/ui/utils'
import { NotificationBell } from '@/features/notifications/components/notification-bell'
import { SearchBar } from '@/shared/components/search-bar'
import { useAuth } from '@/shared/auth/auth-context'
import { useTheme } from '@/shared/theme/theme-context'

interface MobileNavProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	links: { href: string; label: string }[]
	currentPath: string
}

const NAV_ICONS: Record<string, React.ElementType> = {
	'/': Home,
	'/posts': Newspaper,
	'/publish': PlusCircle,
	'/stickers': QrCode,
}

function isActivePath(pathname: string, href: string) {
	if (href === '/') return pathname === '/'
	return pathname === href || pathname.startsWith(`${href}/`)
}

export function MobileNav({
	open,
	onOpenChange,
	links,
	currentPath,
}: MobileNavProps) {
	const { user, isAuthenticated, logout } = useAuth()
	const { theme, toggleTheme } = useTheme()
	const isDark = theme === 'dark'

	const close = () => onOpenChange(false)

	const handleLogout = () => {
		logout()
		close()
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent side="right" className="flex w-75 flex-col p-0 sm:w-90">
				<SheetHeader className="border-b px-5 pt-6 pb-5">
					<SheetTitle className="flex items-center gap-2.5">
						<img
							src="/logo.png"
							alt="RetrouveCI logo"
							width={24}
							height={24}
							className="rounded-xl"
						/>
						<span className="text-lg font-bold tracking-tight">
							Retrouve<span className="text-accent-orange">CI</span>
						</span>
					</SheetTitle>
					<SheetDescription className="sr-only">
						Menu de navigation principal
					</SheetDescription>
				</SheetHeader>

				<div className="px-3 pt-4">
					<SearchBar
						mode="navigate"
						action="/posts"
						size="sm"
						showSubmit={false}
						onSubmit={close}
						placeholder="Rechercher un objet..."
					/>
				</div>

				<nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
					{links.map(link => {
						const Icon = NAV_ICONS[link.href] ?? Home
						const isActive = isActivePath(currentPath, link.href)
						return (
							<Link
								key={link.href}
								to={link.href}
								onClick={close}
								className={cn(
									'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all',
									isActive
										? 'bg-primary-green text-white shadow-sm'
										: 'text-foreground hover:bg-muted',
								)}
							>
								<Icon className="h-4.5 w-4.5 shrink-0" />
								<span className="flex-1">{link.label}</span>
								{isActive && <ChevronRight className="h-4 w-4 opacity-70" />}
							</Link>
						)
					})}
				</nav>

				<div className="space-y-2 border-t px-3 pt-3 pb-6">
					<button
						onClick={toggleTheme}
						className="hover:bg-muted flex w-full items-center justify-between rounded-xl px-4 py-3 transition-colors"
					>
						<span className="flex items-center gap-3 text-sm font-medium">
							{isDark ? (
								<Sun className="h-4 w-4 shrink-0" />
							) : (
								<Moon className="h-4 w-4 shrink-0" />
							)}
							{isDark ? 'Mode clair' : 'Mode sombre'}
						</span>
					</button>

					<Button
						asChild
						className="bg-primary-green hover:bg-primary-green-dark h-12 w-full gap-2 rounded-xl text-white"
					>
						<Link to="/publish" onClick={close}>
							<Plus className="h-4 w-4" />
							Publier une annonce
						</Link>
					</Button>

					{isAuthenticated ? (
						<>
							<div className="flex items-center gap-2">
								<Link
									to="/account"
									onClick={close}
									className="bg-muted/60 hover:bg-muted flex flex-1 items-center gap-3 rounded-xl px-4 py-3 transition-colors"
								>
									<div className="bg-primary-green/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
										<User className="text-primary-green h-4 w-4" />
									</div>
									<div className="min-w-0 flex-1">
										<p className="truncate text-sm font-semibold">
											{user?.name}
										</p>
										<p className="text-muted-foreground truncate text-xs">
											Voir mon compte
										</p>
									</div>
									<ChevronRight className="text-muted-foreground h-4 w-4 shrink-0" />
								</Link>
								<NotificationBell />
							</div>
							<Button
								variant="outline"
								className="text-destructive border-destructive/20 hover:bg-destructive/5 hover:text-destructive h-11 w-full justify-start gap-3"
								onClick={handleLogout}
							>
								<LogOut className="h-4 w-4" />
								Se déconnecter
							</Button>
						</>
					) : (
						<Button
							variant="outline"
							className="h-12 w-full gap-2 rounded-xl"
							asChild
						>
							<Link to="/auth/login" onClick={close}>
								<LogIn className="h-4 w-4" />
								Se connecter
							</Link>
						</Button>
					)}
				</div>
			</SheetContent>
		</Sheet>
	)
}
