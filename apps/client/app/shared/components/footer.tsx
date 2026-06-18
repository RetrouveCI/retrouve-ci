import { Link } from 'react-router'
import {
	Mail,
	MessageSquare,
	MapPin,
	Facebook,
	Instagram,
	Twitter,
	Heart,
} from 'lucide-react'
import { LogoRetrouveCI } from './logo-retrouveci'

const footerLinks = {
	navigation: [
		{ href: '/', label: 'Accueil' },
		{ href: '/posts', label: 'Annonces' },
		{ href: '/publish', label: 'Publier' },
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

const socials = [
	{ icon: Facebook, label: 'Facebook', href: '#' },
	{ icon: Instagram, label: 'Instagram', href: '#' },
	{ icon: Twitter, label: 'X (Twitter)', href: '#' },
]

const contactItems = [
	{
		icon: Mail,
		label: 'contact@retrouveci.ci',
		href: 'mailto:contact@retrouveci.ci',
	},
	{
		icon: MessageSquare,
		label: '+225 07 00 00 00 00',
		href: 'https://wa.me/2250700000000',
	},
	{ icon: MapPin, label: 'Cocody, Abidjan — Côte d’Ivoire', href: null },
]

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
			<div className="container mx-auto px-4 py-12 md:py-16">
				<div className="grid gap-10 md:grid-cols-12">
					<div className="flex flex-col space-y-4 md:col-span-4">
						<Link to="/" className="w-fit">
							<LogoRetrouveCI />
						</Link>
						<p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
							Plateforme de gestion des objets perdus et retrouvés en Côte
							d&apos;Ivoire. Perdre un objet n&apos;est plus une fatalité.
						</p>
						<div className="flex items-center gap-2 pt-1">
							{socials.map(({ icon: Icon, label, href }) => (
								<a
									key={label}
									href={href}
									aria-label={label}
									target="_blank"
									rel="noopener noreferrer"
									className="bg-background text-muted-foreground hover:border-primary-green/40 hover:text-primary-green flex h-9 w-9 items-center justify-center rounded-full border transition-colors"
								>
									<Icon className="h-4 w-4" />
								</a>
							))}
						</div>
					</div>

					<div className="md:col-span-2">
						<FooterLinkGroup
							title="Navigation"
							links={footerLinks.navigation}
						/>
					</div>
					<div className="md:col-span-3">
						<FooterLinkGroup
							title="Informations légales"
							links={footerLinks.legal}
						/>
					</div>

					<div className="md:col-span-3">
						<h3 className="text-foreground mb-4 text-sm font-semibold tracking-wider uppercase">
							Contact
						</h3>
						<ul className="space-y-3">
							{contactItems.map(({ icon: Icon, label, href }) => {
								const content = (
									<span className="text-muted-foreground flex items-start gap-2.5 text-sm">
										<Icon className="text-primary-green mt-0.5 h-4 w-4 shrink-0" />
										<span>{label}</span>
									</span>
								)
								return (
									<li key={label}>
										{href ? (
											<a
												href={href}
												target="_blank"
												rel="noopener noreferrer"
												className="hover:[&_span]:text-foreground transition-colors"
											>
												{content}
											</a>
										) : (
											content
										)}
									</li>
								)
							})}
						</ul>
					</div>
				</div>

				<div className="mt-12 flex flex-col items-center justify-between gap-3 border-t pt-8 sm:flex-row">
					<p className="text-muted-foreground text-sm">
						&copy; {currentYear} RetrouveCI. Tous droits réservés.
					</p>
					<p className="text-muted-foreground flex items-center gap-1.5 text-sm">
						Fait avec{' '}
						<Heart className="text-accent-orange h-4 w-4 fill-current" /> en
						Côte d&apos;Ivoire
					</p>
				</div>
			</div>
		</footer>
	)
}
