import { Fragment } from 'react'
import { Link } from 'react-router'
import { Button } from '@retrouve-ci/ui/components'
import { cn } from '@retrouve-ci/ui/utils'
import { usePageMeta } from '@/shared/lib/page-meta'
import { MobileSidebar } from './sidebar'
import { useDashboard } from './dashboard-context'
import { ThemeToggle } from './theme-toggle'
import { Bell, ChevronRight } from 'lucide-react'

export function TopBar() {
	const { title, breadcrumb } = usePageMeta()
	const { collapsed, counts } = useDashboard()
	const unreadCount = counts.notificationsUnread

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
				</div>
			</div>
		</header>
	)
}
