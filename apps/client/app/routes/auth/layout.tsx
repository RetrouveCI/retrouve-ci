import { Link, Outlet } from 'react-router'
import { BrandingPanel } from './components/branding-panel'

export default function AuthLayout() {
	return (
		// One height, on this root alone: `min-h-screen` was written three times
		// over, and `100vh` counts the mobile browser's URL bar, which is not
		// there. The column goes under the strip between `md` and `lg`, and beside
		// the panel from `lg`.
		<div className="flex min-h-dvh flex-col lg:flex-row">
			<BrandingPanel />

			<div className="bg-background flex flex-1 flex-col justify-center p-6 lg:p-12">
				{/* No logo bar here any more: each page draws the one bar the canvas
				    shows, carrying the back control and its own identity. */}
				<div className="mx-auto w-full max-w-md lg:max-w-105">
					<Outlet />

					<div className="mt-8 border-t pt-6">
						<p className="text-muted-foreground text-center text-xs">
							En continuant, vous acceptez nos{' '}
							<Link
								to="/terms"
								className="text-primary-green font-semibold hover:underline"
							>
								conditions d&apos;utilisation
							</Link>{' '}
							et notre{' '}
							<Link
								to="/privacy"
								className="text-primary-green font-semibold hover:underline"
							>
								politique de confidentialité
							</Link>
							.
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}
