import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router'
import {
	Avatar,
	AvatarFallback,
	Button,
	Sheet,
	SheetContent,
	SheetTrigger,
} from '@retrouve-ci/ui/components'
import { cn } from '@retrouve-ci/ui/utils'
import { useAuth } from '@/shared/auth/auth-context'
import {
	LayoutDashboard,
	Users,
	QrCode,
	FileText,
	Activity,
	LogOut,
	Menu,
	Shield,
	ChevronRight,
	Package,
	Bell,
	Mail,
} from 'lucide-react'

const menuItems = [
	{ to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
	{ to: '/users', icon: Users, label: 'Utilisateurs', exact: false },
	{ to: '/qr', icon: QrCode, label: 'Stickers / QR', exact: false },
	{ to: '/orders', icon: Package, label: 'Commandes', exact: false },
	{ to: '/posts', icon: FileText, label: 'Posts', exact: false },
	{ to: '/events', icon: Activity, label: 'Événements', exact: false },
	{ to: '/administrators', icon: Shield, label: 'Administrateurs', exact: false },
	{ to: '/notifications', icon: Bell, label: 'Notifications', exact: false },
	{
		to: '/contact-messages',
		icon: Mail,
		label: 'Messages de contact',
		exact: false,
	},
]

function SidebarContent({ onItemClick }: { onItemClick?: () => void }) {
	const navigate = useNavigate()
	const { user, logout } = useAuth()

	const handleLogout = async () => {
		await logout()
		void navigate('/auth/login')
	}

	return (
		<div className="from-card to-card/95 flex h-full flex-col bg-linear-to-b">
			<div className="p-6">
				<Link to="/" className="group flex items-center gap-3">
					<img
						src="/logo.png"
						alt="RetrouveCI"
						width={40}
						height={40}
						className="h-10 w-10 rounded-xl transition-transform group-hover:scale-105"
					/>
					<div>
						<h1 className="text-foreground text-lg font-bold">RetrouveCI</h1>
						<p className="text-muted-foreground text-xs">Administration</p>
					</div>
				</Link>
			</div>

			<nav className="flex-1 px-3">
				<p className="text-muted-foreground mb-2 px-3 text-xs font-semibold tracking-wider uppercase">
					Menu
				</p>
				<ul className="space-y-1">
					{menuItems.map(item => {
						const Icon = item.icon
						return (
							<li key={item.to}>
								<NavLink
									to={item.to}
									end={item.exact}
									onClick={onItemClick}
									className={({ isActive }) =>
										cn(
											'group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
											isActive
												? 'bg-primary text-primary-foreground shadow-sm'
												: 'text-muted-foreground hover:bg-muted hover:text-foreground',
										)
									}
								>
									{({ isActive }) => (
										<>
											<div className="flex items-center gap-3">
												<Icon
													size={18}
													className={cn(
														'transition-transform duration-200',
														!isActive && 'group-hover:scale-110',
													)}
												/>
												<span>{item.label}</span>
											</div>
											{isActive && <ChevronRight size={16} />}
										</>
									)}
								</NavLink>
							</li>
						)
					})}
				</ul>
			</nav>

			<div className="border-t p-4">
				<div className="bg-muted/50 rounded-xl p-3">
					<div className="flex items-center gap-3">
						<Avatar className="ring-primary/20 h-10 w-10 ring-2">
							<AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
								{user?.name?.charAt(0) ?? 'A'}
							</AvatarFallback>
						</Avatar>
						<div className="min-w-0 flex-1">
							<p className="truncate text-sm font-semibold">
								{user?.name ?? 'Admin'}
							</p>
							<p className="text-muted-foreground truncate text-xs">
								{user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
							</p>
						</div>
					</div>
					<Button
						variant="ghost"
						size="sm"
						className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive mt-3 w-full justify-start gap-2 rounded-lg"
						onClick={() => void handleLogout()}
					>
						<LogOut size={16} />
						Déconnexion
					</Button>
				</div>
			</div>
		</div>
	)
}

export function Sidebar() {
	return (
		<aside className="bg-card fixed top-0 left-0 z-30 hidden h-screen w-64 border-r shadow-sm lg:block">
			<SidebarContent />
		</aside>
	)
}

export function MobileSidebar() {
	const [open, setOpen] = useState(false)

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button variant="ghost" size="icon" className="lg:hidden">
					<Menu size={20} />
					<span className="sr-only">Toggle menu</span>
				</Button>
			</SheetTrigger>
			<SheetContent side="left" className="w-64 p-0">
				<SidebarContent onItemClick={() => setOpen(false)} />
			</SheetContent>
		</Sheet>
	)
}
