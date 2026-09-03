import { Link, useLocation } from 'react-router'
import { Home, Newspaper, Plus, ScanLine, User, LogIn } from 'lucide-react'
import { cn } from '@app/ui/utils'
import { useAuth } from '@/context/auth'
import { AUTH_PATHS } from '@/shared/helpers/redirect'

function isActiveTab(pathname: string, href: string) {
	if (href === '/') return pathname === '/'
	return pathname === href || pathname.startsWith(`${href}/`)
}

/**
 * The shell's navigation below `lg` — a tablet keeps the tabs (§3). Five slots,
 * and the two that are not destinations are drawn as such: « Publier » is the
 * raised disc at the centre, « Scanner » carries a filled pill behind its icon.
 *
 * « Alertes » left the bar to make room. The bell moved into the header for
 * every width, which is what keeps notifications reachable on a phone.
 */
export function BottomTabBar({
	pendingStickers = 0,
}: {
	pendingStickers?: number
}) {
	const { pathname } = useLocation()
	const { isAuthenticated } = useAuth()

	return (
		<nav
			className="bg-background/95 safe-x fixed inset-x-0 bottom-0 z-40 border-t pb-[var(--safe-bottom)] backdrop-blur-md lg:hidden"
			aria-label="Navigation principale"
		>
			<div className="flex h-16 items-center justify-around px-1">
				<TabLink
					href="/"
					label="Accueil"
					icon={Home}
					active={isActiveTab(pathname, '/')}
				/>
				<TabLink
					href="/posts"
					label="Annonces"
					icon={Newspaper}
					active={isActiveTab(pathname, '/posts')}
				/>

				<Link
					to="/publish"
					aria-label="Publier une annonce"
					className="bg-primary-green hover:bg-primary-green-dark h-control -mt-6 flex w-13 shrink-0 items-center justify-center rounded-full text-white shadow-lg transition-colors"
				>
					<Plus className="h-6 w-6" />
				</Link>

				<TabLink
					href="/scan"
					label="Scanner"
					icon={ScanLine}
					active={isActiveTab(pathname, '/scan')}
					// Scanning is an action, not a place. The pill says so at rest,
					// which is why it does not wait for the tab to be active.
					accent
					count={pendingStickers}
				/>
				{isAuthenticated ? (
					<TabLink
						href="/account"
						label="Compte"
						icon={User}
						active={isActiveTab(pathname, '/account')}
					/>
				) : (
					<TabLink
						href="/login"
						label="Connexion"
						icon={LogIn}
						active={AUTH_PATHS.some(path => pathname === path)}
					/>
				)}
			</div>
		</nav>
	)
}

interface TabLinkProps {
	href: string
	label: string
	icon: React.ElementType
	active: boolean
	accent?: boolean
	/** Drawn only above zero, and read out so it is not colour alone. */
	count?: number
}

function TabLink({
	href,
	label,
	icon: Icon,
	active,
	accent,
	count = 0,
}: TabLinkProps) {
	return (
		<Link
			to={href}
			aria-label={count > 0 ? `${label} — ${count} à activer` : undefined}
			className={cn(
				'flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-xs font-medium transition-colors',
				active || accent ? 'text-primary-green-text' : 'text-muted-foreground',
			)}
		>
			<span className="relative">
				{accent ? (
					<span className="bg-primary-green/10 flex h-6.5 w-8.5 items-center justify-center rounded-full">
						<Icon className="h-[19px] w-[19px]" />
					</span>
				) : (
					<Icon className={cn('h-5 w-5', active && 'fill-primary-green/15')} />
				)}
				{count > 0 && (
					<span
						aria-hidden
						className="bg-accent-orange text-accent-orange-foreground absolute -top-1.5 -right-2 flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1 text-xs leading-none font-bold"
					>
						{count > 9 ? '9+' : count}
					</span>
				)}
			</span>
			{label}
		</Link>
	)
}
