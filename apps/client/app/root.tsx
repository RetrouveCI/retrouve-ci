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
import { ActivityHub } from '@/components/activity-hub'
import { ThemeProvider } from '@/context/theme'
import { getThemeFromRequest } from '@/shared/helpers/theme.server'
import { publicEnv } from '@/shared/helpers/env'
import { PublicEnvScript } from '@/components/public-env-script'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { NotFoundContent } from '@/components/not-found-content'

import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'
import geistLatin from '@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url'
import geistMonoLatin from '@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2?url'
import './app.css'

import type { Route } from './+types/root'
import {
	BRAND_COLOR,
	OG_IMAGE,
	OG_LOCALE,
	SITE_NAME,
} from '@/shared/helpers/page-meta'

export function loader({ request }: Route.LoaderArgs) {
	return { theme: getThemeFromRequest(request), env: publicEnv() }
}

export function meta() {
	const title = `${SITE_NAME} - Perdre un objet n'est plus une fatalité`
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
		{ name: 'theme-color', content: BRAND_COLOR },
		{ property: 'og:type', content: 'website' },
		{ property: 'og:locale', content: OG_LOCALE },
		{ property: 'og:site_name', content: SITE_NAME },
		{ property: 'og:title', content: title },
		{
			property: 'og:description',
			content:
				"Plateforme de gestion des objets perdus et retrouvés en Côte d'Ivoire.",
		},
		{ property: 'og:image', content: OG_IMAGE },
		{ name: 'twitter:card', content: 'summary_large_image' },
		{ name: 'twitter:title', content: title },
		{
			name: 'twitter:description',
			content:
				"Plateforme de gestion des objets perdus et retrouvés en Côte d'Ivoire.",
		},
		{ name: 'twitter:image', content: OG_IMAGE },
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
