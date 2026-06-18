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
	{
		to: '/administrators',
		icon: Shield,
		label: 'Administrateurs',
		exact: false,
	},
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
		<div className="bg-card flex h-full flex-col">
			<div className="flex h-16 items-center px-5">
				<Link to="/" className="flex items-center gap-2.5">
					<img
						src="/logo.png"
						alt="RetrouveCI"
						width={32}
						height={32}
						className="h-8 w-8 rounded-lg"
					/>
					<div className="leading-tight">
						<h1 className="text-foreground text-sm font-semibold">
							RetrouveCI
						</h1>
						<p className="text-muted-foreground text-xs">Administration</p>
					</div>
				</Link>
			</div>

			<nav className="flex-1 overflow-y-auto px-3 py-4">
				<p className="text-muted-foreground/70 mb-2 px-3 text-[11px] font-medium tracking-wider uppercase">
					Menu
				</p>
				<ul className="space-y-0.5">
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
											'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
											isActive
												? 'bg-primary/10 text-primary'
												: 'text-muted-foreground hover:bg-muted hover:text-foreground',
										)
									}
								>
									<Icon size={18} className="shrink-0" />
									<span>{item.label}</span>
								</NavLink>
							</li>
						)
					})}
				</ul>
			</nav>

			<div className="p-3">
				<div className="flex items-center gap-3 rounded-lg px-2 py-2">
					<Avatar className="h-9 w-9">
						<AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
							{user?.name?.charAt(0) ?? 'A'}
						</AvatarFallback>
					</Avatar>
					<div className="min-w-0 flex-1">
						<p className="truncate text-sm font-medium">
							{user?.name ?? 'Admin'}
						</p>
						<p className="text-muted-foreground truncate text-xs">
							{user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
						</p>
					</div>
					<Button
						variant="ghost"
						size="icon"
						className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-8 w-8 shrink-0 rounded-lg"
						onClick={() => void handleLogout()}
						aria-label="Déconnexion"
					>
						<LogOut size={16} />
					</Button>
				</div>
			</div>
		</div>
	)
}

export function Sidebar() {
	return (
		<aside className="bg-card fixed top-0 left-0 z-30 hidden h-screen w-64 border-r lg:block">
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
