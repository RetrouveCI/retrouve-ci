import { Link } from 'react-router'
import { LogoRetrouveCI } from './logo-retrouveci'

const footerLinks = {
	navigation: [
		{ href: '/', label: 'Accueil' },
		{ href: '/posts', label: 'Annonces' },
		{ href: '/stickers', label: 'Stickers QR' },
		{ href: '/download', label: 'Télécharger' },
	],
	legal: [
		{ href: '/about', label: 'À propos' },
		{ href: '/contact', label: 'Contact' },
		{ href: '/terms', label: 'Conditions' },
		{ href: '/privacy', label: 'Politique de confidentialité' },
	],
}

function FooterLinkGroup({
	title,
	links,
}: {
	title: string
	links: { href: string; label: string }[]
}) {
	return (
		<div>
			<h3 className="text-foreground mb-4 text-sm font-semibold tracking-wider uppercase">
				{title}
			</h3>
			<ul className="space-y-3">
				{links.map(link => (
					<li key={link.href}>
						<Link
							to={link.href}
							className="text-muted-foreground hover:text-primary-green text-sm transition-colors"
						>
							{link.label}
						</Link>
					</li>
				))}
			</ul>
		</div>
	)
}

export function Footer() {
	const currentYear = new Date().getFullYear()

	return (
		<footer className="bg-muted/30 border-t">
			<div className="container mx-auto px-4 py-12">
				<div className="grid gap-8 md:grid-cols-3">
					<div className="flex flex-col space-y-4">
						<Link to="/">
							<LogoRetrouveCI />
						</Link>
						<p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
							Plateforme de gestion des objets perdus et retrouvés en Côte
							d&apos;Ivoire. Perdre un objet n&apos;est plus une fatalité.
						</p>
					</div>

					<FooterLinkGroup title="Navigation" links={footerLinks.navigation} />
					<FooterLinkGroup
						title="Informations légales"
						links={footerLinks.legal}
					/>
				</div>

				<div className="mt-12 border-t pt-8">
					<p className="text-muted-foreground text-center text-sm">
						&copy; {currentYear} RetrouveCI. Tous droits réservés.
					</p>
				</div>
			</div>
		</footer>
	)
}
