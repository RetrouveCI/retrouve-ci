import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/auth-context'
import './globals.css'

const geist = Geist({
	subsets: ['latin'],
	variable: '--font-sans',
})

const geistMono = Geist_Mono({
	subsets: ['latin'],
	variable: '--font-mono',
})

export const metadata: Metadata = {
	title: {
		default: 'RetrouveCI - Retrouver un objet devient simple',
		template: '%s | RetrouveCI',
	},
	description:
		"Plateforme de gestion des objets perdus et retrouvés en Côte d'Ivoire. Publiez une annonce ou utilisez nos stickers QR pour protéger vos objets.",
	keywords: [
		'objets perdus',
		'objets retrouvés',
		"Côte d'Ivoire",
		'QR code',
		'RetrouveCI',
		'lost and found',
	],
	authors: [{ name: 'RetrouveCI' }],
	icons: {
		icon: '/logo.png',
		apple: '/logo.png',
	},
	openGraph: {
		type: 'website',
		locale: 'fr_CI',
		siteName: 'RetrouveCI',
		title: 'RetrouveCI - Retrouver un objet devient simple',
		description:
			"Plateforme de gestion des objets perdus et retrouvés en Côte d'Ivoire.",
		images: [{ url: '/logo.png' }],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'RetrouveCI - Retrouver un objet devient simple',
		description:
			"Plateforme de gestion des objets perdus et retrouvés en Côte d'Ivoire.",
		images: ['/logo.png'],
	},
}

export const viewport: Viewport = {
	themeColor: '#1E7F43',
	width: 'device-width',
	initialScale: 1,
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const isProduction = process.env.NODE_ENV === 'production'

	return (
		<html lang="fr" className={`${geist.variable} ${geistMono.variable}`}>
			<body className="flex min-h-screen flex-col font-sans antialiased">
				<AuthProvider>
					{children}
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

				{isProduction && <Analytics />}
			</body>
		</html>
	)
}
