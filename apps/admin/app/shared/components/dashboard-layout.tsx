import { Outlet } from 'react-router'
import { cn } from '@retrouve-ci/ui/utils'
import { requireAdminSession } from '@/shared/auth/auth.server'
import { Sidebar } from './sidebar'
import { TopBar } from './topbar'
import { NavigationProgress } from './navigation-progress'
import { DashboardProvider, useDashboard } from './dashboard-context'
import type { Route } from './+types/dashboard-layout'

export async function loader({ request }: Route.LoaderArgs) {
	await requireAdminSession(request)
	const cookie = request.headers.get('cookie') ?? ''
	const sidebarCollapsed = /(?:^|;\s*)sidebar_collapsed=1(?:;|$)/.test(cookie)
	return { sidebarCollapsed }
}

function DashboardShell() {
	const { collapsed } = useDashboard()

	return (
		<div className="bg-surface-muted min-h-screen">
			<Sidebar />
			<NavigationProgress />
			<TopBar />
			<main
				className={cn(
					'bg-surface-muted min-h-screen pt-16 transition-[padding] duration-200',
					collapsed ? 'lg:pl-20' : 'lg:pl-64',
				)}
			>
				<Outlet />
			</main>
		</div>
	)
}

export default function DashboardLayout({ loaderData }: Route.ComponentProps) {
	return (
		<DashboardProvider initialCollapsed={loaderData.sidebarCollapsed}>
			<DashboardShell />
		</DashboardProvider>
	)
}
