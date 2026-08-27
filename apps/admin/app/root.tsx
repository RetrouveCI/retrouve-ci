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
import { AuthProvider } from '@/context/auth'
import { ThemeProvider } from '@/context/theme'
import { resolveRouteMeta } from '@/shared/helpers/page-meta'

import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'
import geistLatin from '@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url'
import geistMonoLatin from '@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2?url'
import './app.css'

import type { Route } from './+types/root'
import { publicEnv } from '@/shared/helpers/env'
import { PublicEnvScript } from '@/components/public-env-script'

export function loader({ request }: Route.LoaderArgs) {
	const cookie = request.headers.get('cookie') ?? ''
	const theme = /(?:^|;\s*)theme=dark(?:;|$)/.test(cookie) ? 'dark' : 'light'

	return { theme: theme as 'light' | 'dark', env: publicEnv() }
}

const SITE_NAME = 'RetrouveCI Admin'

export function meta({ matches }: Route.MetaArgs) {
	const { title: pageTitle } = resolveRouteMeta(matches)
	const title = pageTitle
		? `${pageTitle} | ${SITE_NAME}`
		: `${SITE_NAME} - Backoffice`
	const description =
		'Administration de la plateforme RetrouveCI - Gestion des QR codes, utilisateurs et posts'

	return [
		{ title },
		{ name: 'description', content: description },
		{ property: 'og:title', content: title },
		{ property: 'og:description', content: description },
		{ property: 'og:image', content: '/logo.png' },
	]
}

export function links() {
	return [
		{ rel: 'icon', href: '/logo.png' },
		// The stylesheet only reveals the font file once parsed, so the first paint
		// swaps. Preload the latin subset — the only one a French page matches.
		// `crossOrigin` is required even same-origin: a font is fetched in CORS
		// mode, and without it the preload is discarded and the file fetched twice.
		...[geistLatin, geistMonoLatin].map(href => ({
			rel: 'preload',
			as: 'font',
			type: 'font/woff2',
			href,
			crossOrigin: 'anonymous',
		})),
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
				<PublicEnvScript env={data?.env} />
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
