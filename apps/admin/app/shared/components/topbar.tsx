import { Fragment } from 'react'
import { Link, useNavigate } from 'react-router'
import {
	Avatar,
	AvatarFallback,
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@retrouve-ci/ui/components'
import { cn } from '@retrouve-ci/ui/utils'
import { useAuth } from '@/shared/auth/auth-context'
import { usePageMeta } from '@/shared/lib/page-meta'
import { MobileSidebar } from './sidebar'
import { useDashboard } from './dashboard-context'
import { ThemeToggle } from './theme-toggle'
import { Bell, LogOut, User, ChevronDown, ChevronRight } from 'lucide-react'

export function TopBar() {
	const { user, logout } = useAuth()
	const navigate = useNavigate()
	const { title, breadcrumb } = usePageMeta()
	const { collapsed, counts } = useDashboard()
	const unreadCount = counts.notificationsUnread

	const handleLogout = async () => {
		await logout()
		void navigate('/auth/login')
	}

	return (
		<header
			className={cn(
				'bg-card/95 fixed top-0 right-0 left-0 z-20 h-16 border-b backdrop-blur-sm transition-[left] duration-200',
				collapsed ? 'lg:left-20' : 'lg:left-64',
			)}
		>
			<div className="flex h-full items-center justify-between px-4 lg:px-6">
				<div className="flex min-w-0 items-center gap-2">
					<MobileSidebar />
					<div className="min-w-0">
						{breadcrumb.length > 0 && (
							<nav className="text-muted-foreground flex items-center gap-1 text-xs">
								{breadcrumb.map(crumb => (
									<Fragment key={crumb.to}>
										<Link
											to={crumb.to}
											className="hover:text-foreground transition-colors"
										>
											{crumb.label}
										</Link>
										<ChevronRight size={12} className="shrink-0" />
									</Fragment>
								))}
							</nav>
						)}
						<h2 className="truncate text-base font-semibold lg:text-lg">
							{title}
						</h2>
					</div>
				</div>

				<div className="flex items-center gap-1">
					<ThemeToggle />
					<Button
						variant="ghost"
						size="icon"
						className="relative rounded-lg"
						asChild
					>
						<Link to="/notifications">
							<Bell size={18} />
							{unreadCount > 0 && (
								<span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center">
									<span className="bg-destructive relative inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white">
										{unreadCount > 9 ? '9+' : unreadCount}
									</span>
								</span>
							)}
							<span className="sr-only">Notifications</span>
						</Link>
					</Button>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								className="hover:bg-muted gap-2 rounded-lg px-2"
							>
								<Avatar className="h-8 w-8">
									<AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
										{user?.name?.charAt(0) ?? 'A'}
									</AvatarFallback>
								</Avatar>
								<div className="hidden text-left md:block">
									<p className="text-sm leading-none font-medium">
										{user?.name ?? 'Admin'}
									</p>
									<p className="text-muted-foreground mt-0.5 text-xs">
										{user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
									</p>
								</div>
								<ChevronDown
									size={16}
									className="text-muted-foreground hidden md:block"
								/>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
							<DropdownMenuLabel className="font-normal">
								<div className="flex flex-col space-y-1">
									<p className="text-sm font-semibold">
										{user?.name ?? 'Admin User'}
									</p>
									<p className="text-muted-foreground text-xs">
										{user?.email ?? 'admin@retrouveci.com'}
									</p>
								</div>
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem asChild className="cursor-pointer rounded-lg">
								<Link to="/profile" className="flex w-full items-center gap-2">
									<User size={16} />
									Mon profil
								</Link>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={() => void handleLogout()}
								className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer rounded-lg"
							>
								<LogOut size={16} className="mr-2" />
								Déconnexion
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</header>
	)
}
