'use client'

import { Button, Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@retrouve-ci/ui/components'
import Link from 'next/link'
import Image from 'next/image'
import {
	Home,
	Newspaper,
	PlusCircle,
	QrCode,
	LogIn,
	LogOut,
	User,
	ChevronRight,
} from 'lucide-react'
import { cn } from '@retrouve-ci/ui/utils'
import { useAuth } from '@/contexts/auth-context'

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

export function MobileNav({
	open,
	onOpenChange,
	links,
	currentPath,
}: MobileNavProps) {
	const { user, isAuthenticated, logout } = useAuth()

	const handleLogout = () => {
		logout()
		onOpenChange(false)
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent
				side="right"
				className="flex w-[300px] flex-col p-0 sm:w-[360px]"
			>
				{/* Header */}
				<SheetHeader className="border-b px-5 pt-6 pb-5">
					<SheetTitle className="flex items-center gap-2.5">
						<Image
							src="/logo.png"
							alt="RetrouveCI logo"
							width={34}
							height={34}
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

				{/* Nav links */}
				<nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
					{links.map(link => {
						const Icon = NAV_ICONS[link.href] ?? Home
						const isActive = currentPath === link.href
						return (
							<Link
								key={link.href}
								href={link.href}
								onClick={() => onOpenChange(false)}
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

				{/* Auth Section */}
				<div className="space-y-2 border-t px-3 pt-3 pb-6">
					{isAuthenticated ? (
						<>
							<Link
								href="/account"
								onClick={() => onOpenChange(false)}
								className="bg-muted/60 hover:bg-muted flex items-center gap-3 rounded-xl px-4 py-3 transition-colors"
							>
								<div className="bg-primary-green/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
									<User className="text-primary-green h-4 w-4" />
								</div>
								<div className="min-w-0 flex-1">
									<p className="truncate text-sm font-semibold">{user?.name}</p>
									<p className="text-muted-foreground truncate text-xs">
										Voir mon compte
									</p>
								</div>
								<ChevronRight className="text-muted-foreground h-4 w-4 shrink-0" />
							</Link>
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
							className="bg-primary-green hover:bg-primary-green-dark h-12 w-full gap-2 rounded-xl text-white"
							asChild
						>
							<Link href="/auth/login" onClick={() => onOpenChange(false)}>
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
