import { useEffect, useState } from 'react'
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
import { useAuth } from '@/shared/auth/auth-context'
import { apiFetch } from '@/shared/lib/api-client'
import { MobileSidebar } from './sidebar'
import { Bell, LogOut, User, ChevronDown } from 'lucide-react'

interface TopBarProps {
	title: string
}

export function TopBar({ title }: TopBarProps) {
	const { user, logout } = useAuth()
	const navigate = useNavigate()
	const [unreadCount, setUnreadCount] = useState(0)

	useEffect(() => {
		apiFetch<{ count: number }>('/notifications/unread-count')
			.then(res => setUnreadCount(res.count))
			.catch(() => {})
	}, [])

	const handleLogout = async () => {
		await logout()
		void navigate('/auth/login')
	}

	return (
		<header className="bg-card/80 fixed top-0 right-0 left-0 z-20 h-16 border-b backdrop-blur-md lg:left-64">
			<div className="flex h-full items-center justify-between px-4 lg:px-6">
				<div className="flex items-center gap-3">
					<MobileSidebar />
					<div>
						<h2 className="text-lg font-bold lg:text-xl">{title}</h2>
					</div>
				</div>

				<div className="flex items-center gap-3">
					<Button
						variant="ghost"
						size="icon"
						className="relative rounded-full"
						asChild
					>
						<Link to="/notifications">
							<Bell size={18} />
							{unreadCount > 0 && (
								<span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center">
									<span className="bg-destructive absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
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
								className="hover:bg-muted gap-2 rounded-full px-2"
							>
								<Avatar className="ring-primary/20 h-8 w-8 ring-2">
									<AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
										{user?.name?.charAt(0) ?? 'A'}
									</AvatarFallback>
								</Avatar>
								<div className="hidden text-left md:block">
									<p className="text-sm leading-none font-medium">
										{user?.name ?? 'Admin'}
									</p>
									<p className="text-muted-foreground text-xs">
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
