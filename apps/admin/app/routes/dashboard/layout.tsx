import { Outlet } from 'react-router'
import { cn } from '@app/ui/utils'
import { Sidebar } from '@/components/sidebar'
import { TopBar } from '@/components/topbar'
import { NavigationProgress } from '@/components/navigation-progress'
import { DashboardProvider, useDashboard } from '@/context/dashboard'
import { dashboardLoader } from './servers/dashboard.loader'
import type { Route } from './+types/layout'

export const loader = dashboardLoader

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
		<DashboardProvider
			initialCollapsed={loaderData.sidebarCollapsed}
			counts={loaderData.counts}
		>
			<DashboardShell />
		</DashboardProvider>
	)
}
