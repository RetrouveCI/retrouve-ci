import { Toaster } from '@retrouve-ci/ui/components'
import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/contexts/auth-context'
import './globals.css'

const montserrat = Montserrat({
	subsets: ['latin'],
	variable: '--font-montserrat',
})

export const metadata: Metadata = {
	title: 'RetrouveCI Admin - Backoffice',
	description:
		'Administration de la plateforme RetrouveCI - Gestion des QR codes, utilisateurs et posts',
	icons: {
		icon: '/logo.png',
		apple: '/logo.png',
	},
	openGraph: {
		title: 'RetrouveCI Admin',
		description: 'Administration de la plateforme RetrouveCI',
		images: ['/logo.png'],
	},
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="fr">
			<body className={`${montserrat.variable} font-sans antialiased`}>
				<AuthProvider>
					{children}
					<Toaster position="top-right" />
					{process.env.NODE_ENV === 'production' && <Analytics />}
				</AuthProvider>
			</body>
		</html>
	)
}
