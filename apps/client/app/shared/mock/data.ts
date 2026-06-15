import type { LostItem } from '@/shared/types/lost-item'
import type { User } from '@/shared/types/user'
import type { Sticker } from '@/shared/types/sticker'

const today = new Date()
const daysAgo = (n: number): string => {
	const d = new Date(today)
	d.setDate(d.getDate() - n)
	return d.toISOString().split('T')[0]
}

const relativeDate = (n: number): string => {
	if (n === 0) return "Aujourd'hui"
	if (n === 1) return 'Hier'
	return `Il y a ${n} jours`
}

export const MOCK_LISTINGS: LostItem[] = [
	{
		id: '1',
		title: 'iPhone 14 Pro noir',
		description:
			'Téléphone perdu dans un taxi à Cocody. Écran fissuré au coin. Récompense offerte.',
		location: 'Cocody, Abidjan',
		ville: 'Abidjan',
		commune: 'Cocody',
		date: relativeDate(2),
		dateISO: daysAgo(2),
		type: 'lost',
		category: 'phones',
		image: '/placeholder.svg?height=300&width=400',
	},
	{
		id: '2',
		title: 'Trousseau de clés avec porte-clés rouge',
		description:
			'Clés trouvées près de la pharmacie du marché de Treichville. 4 clés avec un porte-clés rouge.',
		location: 'Treichville, Abidjan',
		ville: 'Abidjan',
		commune: 'Treichville',
		date: relativeDate(1),
		dateISO: daysAgo(1),
		type: 'found',
		category: 'keys',
	},
	{
		id: '3',
		title: 'Portefeuille en cuir marron',
		description:
			"Portefeuille perdu contenant des documents importants. Pas de récompense pour l'argent, juste les papiers.",
		location: 'Plateau, Abidjan',
		ville: 'Abidjan',
		commune: 'Plateau',
		date: relativeDate(3),
		dateISO: daysAgo(3),
		type: 'lost',
		category: 'wallets',
	},
	{
		id: '4',
		title: 'Sac à dos noir Eastpak',
		description:
			'Sac trouvé au terminal de bus de Yopougon. Contient des livres et une trousse.',
		location: 'Yopougon, Abidjan',
		ville: 'Abidjan',
		commune: 'Yopougon',
		date: relativeDate(0),
		dateISO: daysAgo(0),
		type: 'found',
		category: 'bags',
	},
	{
		id: '5',
		title: 'MacBook Air M1 gris',
		description:
			'Ordinateur portable oublié dans un café. Autocollants sur le couvercle.',
		location: 'Marcory, Abidjan',
		ville: 'Abidjan',
		commune: 'Marcory',
		date: relativeDate(1),
		dateISO: daysAgo(1),
		type: 'lost',
		category: 'electronics',
		image: '/placeholder.svg?height=300&width=400',
	},
	{
		id: '6',
		title: "Carte d'identité nationale",
		description:
			'Document trouvé près de la mairie. Nom partiellement visible.',
		location: 'Adjamé, Abidjan',
		ville: 'Abidjan',
		commune: 'Adjamé',
		date: relativeDate(4),
		dateISO: daysAgo(4),
		type: 'found',
		category: 'other',
	},
	{
		id: '7',
		title: 'Samsung Galaxy S23 bleu',
		description:
			"Téléphone retrouvé dans le bus SOTRA ligne 14. Fond d'écran avec une photo de famille.",
		location: 'Abobo, Abidjan',
		ville: 'Abidjan',
		commune: 'Abobo',
		date: relativeDate(0),
		dateISO: daysAgo(0),
		type: 'found',
		category: 'phones',
		image: '/placeholder.svg?height=300&width=400',
	},
	{
		id: '8',
		title: 'Sac à main rouge en cuir',
		description:
			'Sac perdu au centre commercial Cap Sud. Contient des documents et des effets personnels.',
		location: 'Koumassi, Abidjan',
		ville: 'Abidjan',
		commune: 'Koumassi',
		date: relativeDate(2),
		dateISO: daysAgo(2),
		type: 'lost',
		category: 'bags',
	},
	{
		id: '9',
		title: 'Clés de voiture Toyota',
		description:
			'Trousseau retrouvé sur le parking du supermarché Carrefour. Logo Toyota sur la télécommande.',
		location: 'Riviera, Abidjan',
		ville: 'Abidjan',
		commune: 'Riviera',
		date: relativeDate(0),
		dateISO: daysAgo(0),
		type: 'found',
		category: 'keys',
	},
	{
		id: '10',
		title: 'Casque audio Sony blanc',
		description:
			"Casque oublié dans une salle d'attente. Modèle WH-1000XM4 avec pochette noire.",
		location: 'Plateau, Abidjan',
		ville: 'Abidjan',
		commune: 'Plateau',
		date: relativeDate(1),
		dateISO: daysAgo(1),
		type: 'lost',
		category: 'electronics',
		image: '/placeholder.svg?height=300&width=400',
	},
	{
		id: '11',
		title: 'Carnet de santé enfant',
		description:
			'Carnet de santé trouvé devant le CHU de Treichville. Prénom : Kouamé.',
		location: 'Treichville, Abidjan',
		ville: 'Abidjan',
		commune: 'Treichville',
		date: relativeDate(5),
		dateISO: daysAgo(5),
		type: 'found',
		category: 'other',
	},
	{
		id: '12',
		title: 'Portefeuille noir avec badge étudiant',
		description:
			"Perdu à l'université FHB. Badge étudiant visible à l'intérieur.",
		location: 'Cocody, Abidjan',
		ville: 'Abidjan',
		commune: 'Cocody',
		date: relativeDate(1),
		dateISO: daysAgo(1),
		type: 'lost',
		category: 'wallets',
	},
]

export const MOCK_USER: User = {
	id: 'user-001',
	phone: '07 00 00 00 00',
	name: 'Kouame Jean',
	email: 'kouame.jean@email.com',
	createdAt: '2024-01-15',
}

export const MOCK_STICKERS: Sticker[] = [
	{
		id: 'sticker-001',
		code: 'RCI-A1B2C3',
		label: 'Clés de maison',
		isActive: true,
		activatedAt: '2024-02-10',
		linkedObject: 'Trousseau de clés avec porte-clés rouge',
	},
	{
		id: 'sticker-002',
		code: 'RCI-D4E5F6',
		label: 'Portefeuille',
		isActive: true,
		activatedAt: '2024-03-05',
		linkedObject: 'Portefeuille cuir marron',
	},
	{
		id: 'sticker-003',
		code: 'RCI-G7H8I9',
		label: 'Sac à dos',
		isActive: false,
	},
]
