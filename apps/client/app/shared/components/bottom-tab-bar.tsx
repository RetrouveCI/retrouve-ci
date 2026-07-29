import { Link, useLocation } from 'react-router'
import { Home, Newspaper, Plus, Bell, User, LogIn } from 'lucide-react'
import { cn } from '@retrouve-ci/ui/utils'
import { useAuth } from '@/shared/auth/auth-context'

function isActiveTab(pathname: string, href: string) {
	if (href === '/') return pathname === '/'
	return pathname === href || pathname.startsWith(`${href}/`)
}

export function BottomTabBar() {
	const { pathname } = useLocation()
	const { isAuthenticated } = useAuth()

	return (
		<nav
			className="bg-background/95 fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur-md md:hidden"
			style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
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
					className="bg-primary-green hover:bg-primary-green-dark -mt-6 flex h-13 w-13 shrink-0 items-center justify-center rounded-full text-white shadow-lg transition-colors"
				>
					<Plus className="h-6 w-6" />
				</Link>

				<TabLink
					href="/notifications"
					label="Alertes"
					icon={Bell}
					active={isActiveTab(pathname, '/notifications')}
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
						href="/auth/login"
						label="Connexion"
						icon={LogIn}
						active={isActiveTab(pathname, '/auth')}
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
}

function TabLink({ href, label, icon: Icon, active }: TabLinkProps) {
	return (
		<Link
			to={href}
			className={cn(
				'flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-medium transition-colors',
				active ? 'text-primary-green' : 'text-muted-foreground',
			)}
		>
			<Icon className={cn('h-5 w-5', active && 'fill-primary-green/15')} />
			{label}
		</Link>
	)
}
