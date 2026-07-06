import {
	Button,
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from '@retrouve-ci/ui/components'
import { Link } from 'react-router'
import { LogIn, LogOut, Moon, Sun } from 'lucide-react'
import { SearchBar } from '@/shared/components/search-bar'
import { useAuth } from '@/shared/auth/auth-context'
import { useTheme } from '@/shared/theme/theme-context'

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

				<div className="flex-1 px-3 pt-4">
					<SearchBar
						mode="navigate"
						action="/posts"
						size="sm"
						showSubmit={false}
						onSubmit={close}
						placeholder="Rechercher un objet..."
					/>
				</div>

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
