import { useEffect, useState } from 'react'
import {
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLocation,
	useRouteLoaderData,
} from 'react-router'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/context/auth'
import { ThemeProvider } from '@/context/theme'
import {
	DEFAULT_THEME_PREFERENCE,
	THEME_COLOR,
	THEME_COOKIE,
	type ThemePreference,
} from '@/shared/helpers/theme'
import { getThemePreferenceFromRequest } from '@/shared/helpers/theme.server'
import { publicEnv } from '@/shared/helpers/env'
import { PublicEnvScript } from '@/components/public-env-script'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { NotFoundContent } from '@/components/not-found-content'
import { OfflineContent } from '@/components/offline-content'
import { registerServiceWorker } from '@/shared/helpers/service-worker'
import {
	INSTALL_PROMPT_SCRIPT,
	startInstallPromptCapture,
} from '@/shared/helpers/install-prompt'

import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'
import geistLatin from '@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url'
import geistMonoLatin from '@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2?url'
import './app.css'

import type { Route } from './+types/root'
import { OG_IMAGE, OG_LOCALE, SITE_NAME } from '@/shared/helpers/page-meta'

export function loader({ request }: Route.LoaderArgs) {
	return {
		themePreference: getThemePreferenceFromRequest(request),
		env: publicEnv(),
	}
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
		{ rel: 'manifest', href: '/manifest.webmanifest' },
		{ rel: 'icon', type: 'image/png', sizes: '192x192', href: '/icon-192.png' },
		{ rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
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

/**
 * Resolves the theme **before the first paint**, which is the only place it can
 * be done without a flash: `system` depends on `prefers-color-scheme`, a media
 * query the server cannot evaluate. The client hint that mirrors it is not sent
 * on a first request — the very visit that has to be right — so a blocking
 * classic script in `<head>` is what closes the gap.
 *
 * It reads the cookie itself rather than being handed a value, so the same code
 * is correct whether the preference is stored or absent.
 */
const THEME_SCRIPT = `(function(){try{
var m=document.cookie.match(/(?:^|;\\s*)${THEME_COOKIE}=(light|dark|system)/);
var p=m?m[1]:'${DEFAULT_THEME_PREFERENCE}';
var d=p==='dark'||(p==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);
var r=document.documentElement;
r.classList.toggle('dark',d);
r.style.colorScheme=p==='system'?'light dark':p;
var t=document.querySelector('meta[name="theme-color"]');
if(t)t.setAttribute('content',d?'${THEME_COLOR.dark}':'${THEME_COLOR.light}');
}catch(e){}})()`

export function Layout({ children }: { children: React.ReactNode }) {
	const data = useRouteLoaderData<typeof loader>('root')

	const preference: ThemePreference =
		data?.themePreference ?? DEFAULT_THEME_PREFERENCE

	/**
	 * Server-side, `system` cannot be resolved, so the document goes out neutral
	 * and the script above settles it. An explicit choice is rendered here, which
	 * saves the script any work at all.
	 */
	return (
		<html
			lang="fr"
			className={preference === 'dark' ? 'dark' : ''}
			style={{
				colorScheme: preference === 'system' ? 'light dark' : preference,
			}}
			suppressHydrationWarning
		>
			<head>
				<meta charSet="utf-8" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1, viewport-fit=cover"
				/>
				{/* One tag, no `media`: three theme states, and the chosen one may
				    contradict the device. `system` is unresolvable server-side, so
				    this goes out light and the script above corrects it. */}
				<meta
					name="theme-color"
					content={THEME_COLOR[preference === 'dark' ? 'dark' : 'light']}
				/>
				{/* Older iOS ignores the manifest and labels from `<title>`. */}
				<meta name="apple-mobile-web-app-title" content={SITE_NAME} />
				<script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
				<script dangerouslySetInnerHTML={{ __html: INSTALL_PROMPT_SCRIPT }} />
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
	// Only the built app serves `/sw.js`; the dev server has no such file, and a
	// registration that 404s would leave a failed worker on the origin.
	useEffect(() => {
		if (import.meta.env.PROD) registerServiceWorker()
	}, [])

	// Adopts whatever the head script caught before hydration, and keeps
	// listening for an offer that lands later.
	useEffect(startInstallPromptCapture, [])

	return (
		<ThemeProvider initialPreference={loaderData.themePreference}>
			<AuthProvider>
				<Outlet />
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
	const location = useLocation()

	/**
	 * Read once, at the first render: a client-side navigation whose loader
	 * cannot reach the network lands here rather than on the worker's redirect,
	 * and settling this in an effect would flash « Une erreur est survenue »
	 * first. `false` on the server, where an error page still came over the wire
	 * and so is never an offline one.
	 */
	const [isOffline] = useState(
		() => typeof navigator !== 'undefined' && !navigator.onLine,
	)

	if (isRouteErrorResponse(error) && error.status === 404) {
		return (
			<ThemeProvider initialPreference={DEFAULT_THEME_PREFERENCE}>
				<AuthProvider>
					<Header />
					<NotFoundContent />
					<Footer />
				</AuthProvider>
			</ThemeProvider>
		)
	}

	if (isOffline) {
		return (
			<ThemeProvider initialPreference={DEFAULT_THEME_PREFERENCE}>
				<AuthProvider>
					<Header />
					<OfflineContent retryTo={`${location.pathname}${location.search}`} />
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
