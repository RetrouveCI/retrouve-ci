'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@retrouve-ci/ui/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { Avatar, AvatarFallback } from '@retrouve-ci/ui/components/ui/avatar'
import { Button } from '@retrouve-ci/ui/components/ui/button'
import {
	Sheet,
	SheetContent,
	SheetTrigger,
} from '@retrouve-ci/ui/components/ui/sheet'
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
} from 'lucide-react'
import { useState } from 'react'

const menuItems = [
	{ href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
	{ href: '/admin/users', icon: Users, label: 'Utilisateurs' },
	{ href: '/admin/qr', icon: QrCode, label: 'Stickers / QR' },
	{ href: '/admin/orders', icon: Package, label: 'Commandes' },
	{ href: '/admin/posts', icon: FileText, label: 'Posts' },
	{ href: '/admin/events', icon: Activity, label: 'Événements' },
	{ href: '/admin/administrators', icon: Shield, label: 'Administrateurs' },
	{ href: '/admin/notifications', icon: Bell, label: 'Notifications' },
]

function SidebarContent({ onItemClick }: { onItemClick?: () => void }) {
	const pathname = usePathname()
	const router = useRouter()
	const { user, logout } = useAuth()

	const handleLogout = () => {
		logout()
		router.push('/admin/login')
	}

	const isActive = (href: string) => {
		if (href === '/admin')
			return pathname === '/admin' || pathname === '/admin/dashboard'
		return pathname.startsWith(href)
	}

	return (
		<div className="from-card to-card/95 flex h-full flex-col bg-linear-to-b">
			<div className="p-6">
				<Link href="/admin" className="group flex items-center gap-3">
					<Image
						src="/logo.png"
						alt="RetrouveCI"
						width={40}
						height={40}
						className="h-10 w-10"
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
						const active = isActive(item.href)
						return (
							<li key={item.href}>
								<Link
									href={item.href}
									onClick={onItemClick}
									className={cn(
										'group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
										active
											? 'bg-primary text-primary-foreground shadow-sm'
											: 'text-muted-foreground hover:bg-muted hover:text-foreground',
									)}
								>
									<div className="flex items-center gap-3">
										<Icon
											size={18}
											className={cn(
												'transition-transform duration-200',
												!active && 'group-hover:scale-110',
											)}
										/>
										<span>{item.label}</span>
									</div>
									{active && <ChevronRight size={16} />}
								</Link>
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
								{user?.name?.charAt(0) || 'A'}
							</AvatarFallback>
						</Avatar>
						<div className="min-w-0 flex-1">
							<p className="truncate text-sm font-semibold">
								{user?.name || 'Admin'}
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
						onClick={handleLogout}
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
