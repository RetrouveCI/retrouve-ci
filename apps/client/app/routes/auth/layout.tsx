import { Link, Outlet } from 'react-router'
import { BrandingPanel } from './components/branding-panel'

export default function AuthLayout() {
	return (
		<div className="flex min-h-screen">
			<BrandingPanel />

			<div className="bg-background flex min-h-screen flex-1 flex-col">
				<header className="flex items-center justify-between border-b p-4 lg:hidden">
					<Link to="/" className="flex items-center gap-2">
						<img
							src="/logo.png"
							alt="RetrouveCI"
							width={32}
							height={32}
							className="rounded-lg"
						/>
						<span className="text-lg font-bold">
							Retrouve<span className="text-accent-orange">CI</span>
						</span>
					</Link>
				</header>

				<div className="flex flex-1 items-center justify-center p-6 lg:p-12">
					<div className="w-full max-w-md">
						<Outlet />

						<div className="mt-8 border-t pt-6">
							<p className="text-muted-foreground text-center text-xs">
								En continuant, vous acceptez nos{' '}
								<Link
									to="/terms"
									className="text-primary-green hover:underline"
								>
									conditions d&apos;utilisation
								</Link>{' '}
								et notre{' '}
								<Link
									to="/privacy"
									className="text-primary-green hover:underline"
								>
									politique de confidentialité
								</Link>
								.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
