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
import { ThemeProvider } from '@/shared/components/theme-context'

import './app.css'

import type { Route } from './+types/root'

export function loader({ request }: Route.LoaderArgs) {
	const cookie = request.headers.get('cookie') ?? ''
	const theme = /(?:^|;\s*)theme=dark(?:;|$)/.test(cookie) ? 'dark' : 'light'

	return { theme: theme as 'light' | 'dark' }
}

export function meta() {
	const title = 'RetrouveCI Admin - Backoffice'
	const description =
		'Administration de la plateforme RetrouveCI - Gestion des QR codes, utilisateurs et posts'

	return [
		{ title },
		{ name: 'description', content: description },
		{ property: 'og:title', content: 'RetrouveCI Admin' },
		{ property: 'og:description', content: description },
		{ property: 'og:image', content: '/logo.png' },
	]
}

export function links() {
	return [
		{ rel: 'icon', href: '/logo.png' },
		{ rel: 'preconnect', href: 'https://fonts.googleapis.com' },
		{
			rel: 'preconnect',
			href: 'https://fonts.gstatic.com',
			crossOrigin: 'anonymous',
		},
		{
			rel: 'stylesheet',
			href: 'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap',
		},
	]
}

export function Layout({ children }: { children: React.ReactNode }) {
	const data = useRouteLoaderData<typeof loader>('root')
	const theme = data?.theme ?? 'light'

	return (
		<html lang="fr" className={theme === 'dark' ? 'dark' : undefined}>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body className="font-sans antialiased">
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
				<Toaster position="top-right" />
				{import.meta.env.PROD && <Analytics />}
			</AuthProvider>
		</ThemeProvider>
	)
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	if (isRouteErrorResponse(error) && error.status === 404) {
		return (
			<main className="flex min-h-screen flex-col items-center justify-center px-4 py-24 text-center">
				<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
					Page introuvable
				</h1>
			</main>
		)
	}

	return (
		<main className="flex min-h-screen flex-col items-center justify-center px-4 py-24 text-center">
			<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
				Une erreur est survenue
			</h1>
		</main>
	)
}
