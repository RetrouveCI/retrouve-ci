import {
	Button,
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from '@app/ui/components'
import { Link } from 'react-router'
import {
	LogIn,
	LogOut,
	Moon,
	Sun,
	Info,
	MessageCircle,
	FileText,
	ShieldCheck,
	Settings,
} from 'lucide-react'
import { useAuth } from '@/context/auth'
import { useTheme } from '@/context/theme'

const secondaryLinks = [
	{ href: '/about', label: 'À propos', icon: Info },
	{ href: '/contact', label: 'Contact', icon: MessageCircle },
	{ href: '/terms', label: 'Conditions', icon: FileText },
	{ href: '/privacy', label: 'Confidentialité', icon: ShieldCheck },
]

interface MobileNavProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function MobileNav({ open, onOpenChange }: MobileNavProps) {
	const { isAuthenticated, logout } = useAuth()
	const { theme, toggleTheme } = useTheme()
	const isDark = theme === 'dark'

	const close = () => onOpenChange(false)

	const handleLogout = () => {
		logout()
		close()
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent side="left" className="flex w-75 flex-col p-0 sm:w-90">
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

				<nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
					{secondaryLinks.map(({ href, label, icon: Icon }) => (
						<Link
							key={href}
							to={href}
							onClick={close}
							className="text-foreground hover:bg-muted flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all"
						>
							<Icon className="h-4.5 w-4.5 shrink-0" />
							{label}
						</Link>
					))}
					{isAuthenticated && (
						<Link
							to="/account/settings"
							onClick={close}
							className="text-foreground hover:bg-muted flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all"
						>
							<Settings className="h-4.5 w-4.5 shrink-0" />
							Paramètres
						</Link>
					)}
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

					{isAuthenticated ? (
						<Button
							variant="outline"
							className="text-destructive border-destructive/20 hover:bg-destructive/5 hover:text-destructive h-11 w-full justify-start gap-3"
							onClick={handleLogout}
						>
							<LogOut className="h-4 w-4" />
							Se déconnecter
						</Button>
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
