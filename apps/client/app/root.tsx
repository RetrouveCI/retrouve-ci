import { Analytics } from '@vercel/analytics/react'
import {
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useRouteLoaderData,
} from 'react-router'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/shared/auth/auth-context'
import { ActivityHub } from '@/shared/components/activity-hub'
import { ThemeProvider } from '@/shared/theme/theme-context'
import { getThemeFromRequest } from '@/shared/theme/theme.server'
import { Header } from '@/shared/components/header'
import { Footer } from '@/shared/components/footer'
import { NotFoundContent } from '@/shared/components/not-found-content'

import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'
import './app.css'

import type { Route } from './+types/root'

export function loader({ request }: Route.LoaderArgs) {
	return { theme: getThemeFromRequest(request) }
}

export function meta() {
	const title = "RetrouveCI - Perdre un objet n'est plus une fatalité"
	const description =
		"Plateforme de gestion des objets perdus et retrouvés en Côte d'Ivoire. Publiez une annonce ou utilisez nos stickers QR pour protéger vos objets."

	return [
		{ title },
		{ name: 'description', content: description },
		{
			name: 'keywords',
			content:
				"objets perdus, objets retrouvés, Côte d'Ivoire, QR code, RetrouveCI, lost and found",
		},
		{ name: 'theme-color', content: '#1E7F43' },
		{ property: 'og:type', content: 'website' },
		{ property: 'og:locale', content: 'fr_CI' },
		{ property: 'og:site_name', content: 'RetrouveCI' },
		{ property: 'og:title', content: title },
		{
			property: 'og:description',
			content:
				"Plateforme de gestion des objets perdus et retrouvés en Côte d'Ivoire.",
		},
		{ property: 'og:image', content: '/logo.png' },
		{ name: 'twitter:card', content: 'summary_large_image' },
		{ name: 'twitter:title', content: title },
		{
			name: 'twitter:description',
			content:
				"Plateforme de gestion des objets perdus et retrouvés en Côte d'Ivoire.",
		},
		{ name: 'twitter:image', content: '/logo.png' },
	]
}

export function links() {
	return [{ rel: 'icon', href: '/logo.png' }]
}

export function Layout({ children }: { children: React.ReactNode }) {
	const data = useRouteLoaderData<typeof loader>('root')

	const theme = data?.theme ?? 'light'

	return (
		<html
			lang="fr"
			className={theme === 'dark' ? 'dark' : ''}
			style={{ colorScheme: theme }}
			suppressHydrationWarning
		>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body className="flex min-h-screen flex-col font-sans antialiased">
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	)
}

export default function App({ loaderData }: Route.ComponentProps) {
	return (
		<ThemeProvider initialTheme={loaderData.theme}>
			<AuthProvider>
				<Outlet />
				<ActivityHub />
				<Toaster
					position="bottom-right"
					richColors
					closeButton
					toastOptions={{
						classNames: {
							toast: 'font-sans',
						},
					}}
				/>
				{import.meta.env.PROD && <Analytics />}
			</AuthProvider>
		</ThemeProvider>
	)
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	if (isRouteErrorResponse(error) && error.status === 404) {
		return (
			<ThemeProvider initialTheme="light">
				<AuthProvider>
					<Header />
					<NotFoundContent />
					<Footer />
				</AuthProvider>
			</ThemeProvider>
		)
	}

	return (
		<main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
			<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
				Une erreur est survenue
			</h1>
		</main>
	)
}
