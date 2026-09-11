import {
	Activity,
	Bell,
	FileText,
	LayoutDashboard,
	Mail,
	Package,
	QrCode,
	Shield,
	UserRound,
	Users,
	type LucideIcon,
} from 'lucide-react'
import type { LayoutCounts } from '@/shared/types/dashboard'

export interface NavItem {
	to: string
	icon: LucideIcon
	label: string
	exact?: boolean
	badgeKey?: keyof LayoutCounts
	/** What the palette matches it on besides its label, accents aside. */
	keywords: string
}

export interface NavSection {
	label?: string
	items: NavItem[]
}

// The F7 artefact's order: what an operator comes for first, then the work
// queues, then the rest. The sidebar and the palette read this one list.
export const NAV_SECTIONS: NavSection[] = [
	{
		items: [
			{
				to: '/',
				icon: LayoutDashboard,
				label: 'Tableau de bord',
				exact: true,
				keywords: 'accueil dashboard statistiques',
			},
			{
				to: '/notifications',
				icon: Bell,
				label: 'Notifications',
				badgeKey: 'notificationsUnread',
				keywords: 'alertes non lues',
			},
		],
	},
	{
		label: 'Modération',
		items: [
			{
				to: '/posts',
				icon: FileText,
				label: 'Annonces',
				keywords: 'posts moderation attente objets perdus trouves',
			},
			{
				to: '/contact-messages',
				icon: Mail,
				label: 'Messages',
				keywords: 'messages de contact',
			},
		],
	},
	{
		label: 'Opérations',
		items: [
			{
				to: '/qr',
				icon: QrCode,
				label: 'Stickers & QR',
				keywords: 'stickers qr codes jetons lots',
			},
			{
				to: '/orders',
				icon: Package,
				label: 'Commandes',
				keywords: 'commandes packs livraison expedier',
			},
		],
	},
	{
		label: 'Communauté',
		items: [
			{
				to: '/users',
				icon: Users,
				label: 'Utilisateurs',
				keywords: 'utilisateurs comptes visiteurs personnes',
			},
			{
				to: '/events',
				icon: Activity,
				label: 'Événements',
				keywords: 'evenements agenda',
			},
		],
	},
	{
		label: 'Système',
		items: [
			{
				to: '/administrators',
				icon: Shield,
				label: 'Administrateurs',
				keywords: 'administrateurs equipe bureau roles',
			},
		],
	},
]

/** Every page the palette can go to: the sidebar's, and the profile its footer holds. */
export const NAV_ITEMS: NavItem[] = [
	...NAV_SECTIONS.flatMap(section => section.items),
	{
		to: '/profile',
		icon: UserRound,
		label: 'Mon profil',
		keywords: 'profil compte mot de passe',
	},
]

export interface PaletteAction {
	to: string
	label: string
	keywords: string
}

export const PALETTE_ACTIONS: PaletteAction[] = [
	{
		to: '/posts/new',
		label: 'Publier une annonce pour l’équipe',
		keywords: 'publier annonce equipe nouvelle',
	},
	{
		to: '/qr/generate',
		label: 'Générer un lot de stickers',
		keywords: 'generer stickers lot qr codes',
	},
]
