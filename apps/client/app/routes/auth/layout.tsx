import { Link, Outlet, useLoaderData } from 'react-router'
import { loadPublicCounters } from '../home/servers/public-counters'
import { BrandingPanel } from './components/branding-panel'

// A counter the API cannot serve must not take the sign-in screen down.
export async function loader({ request }: { request: Request }) {
	return { counters: await loadPublicCounters(request) }
}

export default function AuthLayout() {
	const { counters } = useLoaderData<typeof loader>()

	return (
		// One height, on this root alone: `min-h-screen` was written three times
		// over, and `100vh` counts the mobile browser's URL bar, which is not
		// there. The column goes under the strip between `md` and `lg`, and beside
		// the panel from `lg`.
		<div className="flex min-h-dvh flex-col lg:flex-row">
			<BrandingPanel counters={counters} />

			<div className="bg-background flex flex-1 flex-col justify-center py-6 pr-[max(1.5rem,var(--safe-right))] pl-[max(1.5rem,var(--safe-left))] lg:py-12 lg:pr-[max(3rem,var(--safe-right))] lg:pl-[max(3rem,var(--safe-left))]">
				{/* No logo bar here any more: each page draws the one bar the canvas
				    shows, carrying the back control and its own identity. */}
				<div className="mx-auto w-full max-w-md lg:max-w-105">
					<Outlet />

					<div className="mt-8 border-t pt-6">
						<p className="text-muted-foreground text-center text-xs">
							En continuant, vous acceptez nos{' '}
							<Link
								to="/terms"
								className="text-primary-green-text font-semibold hover:underline"
							>
								conditions d&apos;utilisation
							</Link>{' '}
							et notre{' '}
							<Link
								to="/privacy"
								className="text-primary-green-text font-semibold hover:underline"
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
