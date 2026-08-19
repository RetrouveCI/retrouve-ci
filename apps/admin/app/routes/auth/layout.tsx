import { Outlet } from 'react-router'
import { redirectIfAdminAuthenticated } from '@/shared/helpers/session.server'
import { BrandingPanel } from './components/branding-panel'
import type { Route } from './+types/layout'

export async function loader({ request }: Route.LoaderArgs) {
	await redirectIfAdminAuthenticated(request)
	return null
}

export default function AuthLayout() {
	return (
		<div className="flex min-h-screen">
			<BrandingPanel />

			<div className="bg-background flex min-h-screen flex-1 flex-col">
				<header className="flex items-center justify-between border-b p-4 lg:hidden">
					<div className="flex items-center gap-2">
						<img
							src="/logo.png"
							alt="RetrouveCI"
							height={32}
							className="h-8 w-auto"
						/>
						<span className="text-lg font-bold">
							Retrouve<span className="text-accent-orange">CI</span>
						</span>
					</div>
				</header>

				<div className="flex flex-1 items-center justify-center p-6 lg:p-12">
					<div className="w-full max-w-md">
						<Outlet />
					</div>
				</div>
			</div>
		</div>
	)
}
