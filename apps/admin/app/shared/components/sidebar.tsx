import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router'
import {
	Avatar,
	AvatarFallback,
	Badge,
	Button,
	Sheet,
	SheetContent,
	SheetTrigger,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@retrouve-ci/ui/components'
import { cn } from '@retrouve-ci/ui/utils'
import { useAuth } from '@/shared/auth/auth-context'
import { useDashboard } from './dashboard-context'
import type { LayoutCounts } from './dashboard-context'
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
	PanelLeftClose,
	PanelLeftOpen,
	type LucideIcon,
} from 'lucide-react'

interface MenuItem {
	to: string
	icon: LucideIcon
	label: string
	exact?: boolean
	badgeKey?: keyof LayoutCounts
}

interface MenuSection {
	label?: string
	items: MenuItem[]
}

const menuSections: MenuSection[] = [
	{
		items: [
			{ to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
		],
	},
	{
		label: 'Modération',
		items: [
			{ to: '/posts', icon: FileText, label: 'Posts' },
			{ to: '/contact-messages', icon: Mail, label: 'Messages de contact' },
		],
	},
	{
		label: 'Croissance',
		items: [
			{ to: '/users', icon: Users, label: 'Utilisateurs' },
			{ to: '/events', icon: Activity, label: 'Événements' },
			{
				to: '/notifications',
				icon: Bell,
				label: 'Notifications',
				badgeKey: 'notificationsUnread',
			},
		],
	},
	{
		label: 'Opérations',
		items: [
			{ to: '/qr', icon: QrCode, label: 'Stickers / QR' },
			{ to: '/orders', icon: Package, label: 'Commandes' },
		],
	},
	{
		label: 'Système',
		items: [{ to: '/administrators', icon: Shield, label: 'Administrateurs' }],
	},
]

function SidebarItem({
	item,
	collapsed,
	badge,
	onItemClick,
}: {
	item: MenuItem
	collapsed: boolean
	badge: number
	onItemClick?: () => void
}) {
	const Icon = item.icon

	const link = (
		<NavLink
			to={item.to}
			end={item.exact}
			prefetch="intent"
			onClick={onItemClick}
			className={({ isActive }) =>
				cn(
					'relative flex items-center rounded-lg text-sm font-medium transition-colors',
					collapsed ? 'mx-auto h-11 w-11 justify-center' : 'gap-3 px-3 py-2',
					isActive
						? 'bg-sidebar-primary text-sidebar-primary-foreground'
						: 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
				)
			}
		>
			{({ isActive }) => (
				<>
					{isActive && !collapsed && (
						<span className="bg-accent absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 rounded-r-full" />
					)}
					<span className="relative shrink-0">
						<Icon size={18} />
						{collapsed && badge > 0 && (
							<span className="bg-accent ring-sidebar absolute -top-1 -right-1 h-2 w-2 rounded-full ring-2" />
						)}
					</span>
					{!collapsed && <span className="flex-1 truncate">{item.label}</span>}
					{!collapsed && badge > 0 && (
						<Badge className="bg-accent text-accent-foreground h-5 min-w-5 justify-center px-1.5 text-[10px]">
							{badge > 99 ? '99+' : badge}
						</Badge>
					)}
				</>
			)}
		</NavLink>
	)

	if (collapsed) {
		return (
			<li>
				<Tooltip>
					<TooltipTrigger asChild>{link}</TooltipTrigger>
					<TooltipContent side="right">
						{item.label}
						{badge > 0 ? ` (${badge})` : ''}
					</TooltipContent>
				</Tooltip>
			</li>
		)
	}

	return <li>{link}</li>
}

function SidebarContent({
	collapsed,
	showCollapseToggle,
	onItemClick,
}: {
	collapsed: boolean
	showCollapseToggle?: boolean
	onItemClick?: () => void
}) {
	const navigate = useNavigate()
	const { user, logout } = useAuth()
	const { counts, toggleSidebar } = useDashboard()

	const handleLogout = async () => {
		await logout()
		void navigate('/auth/login')
	}

	return (
		<div className="bg-sidebar text-sidebar-foreground flex h-full flex-col">
			<div
				className={cn(
					'flex h-16 items-center',
					collapsed ? 'justify-center px-2' : 'px-5',
				)}
			>
				<Link to="/" className="flex items-center gap-2.5">
					<img
						src="/logo.png"
						alt="RetrouveCI"
						width={32}
						height={32}
						className="h-8 w-8 shrink-0 rounded-lg"
					/>
					{!collapsed && (
						<div className="leading-tight">
							<h1 className="text-sidebar-foreground text-sm font-semibold">
								RetrouveCI
							</h1>
							<p className="text-sidebar-foreground/60 text-xs">
								Administration
							</p>
						</div>
					)}
				</Link>
			</div>

			<nav
				className={cn(
					'flex-1 space-y-4 overflow-y-auto py-4',
					collapsed ? 'px-2' : 'px-3',
				)}
			>
				{menuSections.map((section, index) => (
					<div key={section.label ?? `section-${index}`}>
						{section.label && !collapsed && (
							<p className="text-sidebar-foreground/50 mb-2 px-3 text-[11px] font-medium tracking-wider uppercase">
								{section.label}
							</p>
						)}
						<ul className={cn(collapsed ? 'space-y-1.5' : 'space-y-0.5')}>
							{section.items.map(item => (
								<SidebarItem
									key={item.to}
									item={item}
									collapsed={collapsed}
									badge={item.badgeKey ? counts[item.badgeKey] : 0}
									onItemClick={onItemClick}
								/>
							))}
						</ul>
					</div>
				))}
			</nav>

			<div className="border-sidebar-border space-y-1 border-t p-3">
				{showCollapseToggle && (
					<Button
						variant="ghost"
						onClick={toggleSidebar}
						aria-label={collapsed ? 'Déplier le menu' : 'Réduire le menu'}
						className={cn(
							'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full',
							collapsed ? 'justify-center px-0' : 'justify-start gap-3 px-3',
						)}
					>
						{collapsed ? (
							<PanelLeftOpen size={18} />
						) : (
							<>
								<PanelLeftClose size={18} />
								<span className="text-sm font-medium">Réduire</span>
							</>
						)}
					</Button>
				)}

				{collapsed ? (
					<div className="flex flex-col items-center gap-1">
						<Tooltip>
							<TooltipTrigger asChild>
								<Link to="/profile" aria-label="Mon profil">
									<Avatar className="h-9 w-9">
										<AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm font-semibold">
											{user?.name?.charAt(0) ?? 'A'}
										</AvatarFallback>
									</Avatar>
								</Link>
							</TooltipTrigger>
							<TooltipContent side="right">
								{user?.name ?? 'Admin'} · Mon profil
							</TooltipContent>
						</Tooltip>
						<Button
							variant="ghost"
							size="icon"
							className="text-sidebar-foreground/70 hover:bg-destructive/20 h-8 w-8 rounded-lg hover:text-white"
							onClick={() => void handleLogout()}
							aria-label="Déconnexion"
						>
							<LogOut size={16} />
						</Button>
					</div>
				) : (
					<div className="flex items-center gap-3 rounded-lg px-2 py-2">
						<Link
							to="/profile"
							onClick={onItemClick}
							className="flex min-w-0 flex-1 items-center gap-3 transition-opacity hover:opacity-80"
						>
							<Avatar className="h-9 w-9">
								<AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm font-semibold">
									{user?.name?.charAt(0) ?? 'A'}
								</AvatarFallback>
							</Avatar>
							<div className="min-w-0 flex-1">
								<p className="text-sidebar-foreground truncate text-sm font-medium">
									{user?.name ?? 'Admin'}
								</p>
								<p className="text-sidebar-foreground/60 truncate text-xs">
									{user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
								</p>
							</div>
						</Link>
						<Button
							variant="ghost"
							size="icon"
							className="text-sidebar-foreground/70 hover:bg-destructive/20 h-8 w-8 shrink-0 rounded-lg hover:text-white"
							onClick={() => void handleLogout()}
							aria-label="Déconnexion"
						>
							<LogOut size={16} />
						</Button>
					</div>
				)}
			</div>
		</div>
	)
}

export function Sidebar() {
	const { collapsed } = useDashboard()

	return (
		<aside
			className={cn(
				'border-sidebar-border fixed top-0 left-0 z-30 hidden h-screen border-r transition-[width] duration-200 lg:block',
				collapsed ? 'w-20' : 'w-64',
			)}
		>
			<SidebarContent collapsed={collapsed} showCollapseToggle />
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
				<SidebarContent collapsed={false} onItemClick={() => setOpen(false)} />
			</SheetContent>
		</Sheet>
	)
}
