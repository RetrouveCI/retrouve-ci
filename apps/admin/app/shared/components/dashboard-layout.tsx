import { Outlet } from 'react-router'
import { requireAdminSession } from '@/shared/auth/auth.server'
import { Sidebar } from './sidebar'
import type { Route } from './+types/dashboard-layout'

export async function loader({ request }: Route.LoaderArgs) {
	await requireAdminSession(request)
	return null
}

export default function DashboardLayout() {
	return (
		<div className="bg-surface-muted min-h-screen">
			<Sidebar />
			<main className="bg-surface-muted min-h-screen lg:pl-64">
				<Outlet />
			</main>
		</div>
	)
}
