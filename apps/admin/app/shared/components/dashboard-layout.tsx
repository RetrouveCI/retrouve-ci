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
		<div className="bg-background min-h-screen">
			<Sidebar />
			<main className="lg:pl-64">
				<Outlet />
			</main>
		</div>
	)
}
