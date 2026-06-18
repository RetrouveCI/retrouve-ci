import { Link } from 'react-router'
import {
	QrCode,
	FileText,
	Package,
	Settings,
	ChevronRight,
	Plus,
} from 'lucide-react'
import { cn } from '@retrouve-ci/ui/utils'
import type { Sticker } from '@/shared/types/sticker'
import type { UserLostItem } from '@/shared/types/lost-item'

interface AccountNavProps {
	stickers: Sticker[]
	listings: UserLostItem[]
	ordersCount: number
	className?: string
}

export function AccountNav({
	stickers,
	listings,
	ordersCount,
	className,
}: AccountNavProps) {
	const activeStickers = stickers.filter(s => s.isActive).length

	const navItems: {
		href: string
		icon: React.ElementType
		label: string
		count?: number
	}[] = [
		{
			href: '/account/posts',
			icon: FileText,
			label: 'Mes annonces',
			count: listings.length,
		},
		{
			href: '/account/stickers',
			icon: QrCode,
			label: 'Mes stickers QR',
			count: activeStickers,
		},
		{
			href: '/account/orders',
			icon: Package,
			label: 'Mes commandes',
			count: ordersCount,
		},
		{ href: '/account/settings', icon: Settings, label: 'Paramètres' },
	]

	return (
		<div className={cn('space-y-4', className)}>
			<nav className="bg-background border-border/50 overflow-hidden rounded-2xl border">
				{navItems.map(({ href, icon: Icon, label, count }, i) => (
					<Link
						key={href}
						to={href}
						className={cn(
							'group hover:bg-muted/40 flex items-center gap-3 px-4 py-3.5 transition-colors',
							i > 0 && 'border-t',
						)}
					>
						<div className="bg-muted flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110">
							<Icon className="text-muted-foreground h-5 w-5" />
						</div>
						<span className="flex-1 text-sm font-medium">{label}</span>
						{count !== undefined && (
							<span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-semibold">
								{count}
							</span>
						)}
						<ChevronRight className="text-muted-foreground h-4 w-4 transition-transform group-hover:translate-x-0.5" />
					</Link>
				))}
			</nav>

			<div className="grid gap-3">
				<Link
					to="/publish"
					className="group border-accent-orange/30 bg-accent-orange/5 hover:border-accent-orange/50 hover:bg-accent-orange/10 flex items-center gap-3 rounded-2xl border-2 border-dashed p-4 transition-all"
				>
					<div className="bg-accent-orange flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110">
						<Plus className="h-5 w-5 text-white" />
					</div>
					<div>
						<p className="text-sm font-semibold">Nouvelle annonce</p>
						<p className="text-muted-foreground text-xs">
							Objet perdu ou retrouvé
						</p>
					</div>
				</Link>
				<Link
					to="/stickers"
					className="group border-primary-green/30 bg-primary-green/5 hover:border-primary-green/50 hover:bg-primary-green/10 flex items-center gap-3 rounded-2xl border-2 border-dashed p-4 transition-all"
				>
					<div className="bg-primary-green flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110">
						<QrCode className="h-5 w-5 text-white" />
					</div>
					<div>
						<p className="text-sm font-semibold">Commander des stickers</p>
						<p className="text-muted-foreground text-xs">Protégez vos objets</p>
					</div>
				</Link>
			</div>
		</div>
	)
}
