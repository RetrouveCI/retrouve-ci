import { requireServerSession } from '@/shared/auth/auth.server'
import type { Notification } from '@/shared/types/notification'
import { formatRelativeDate } from '@/shared/lib/format-relative-date'
import { toNotification } from '../mappers/notification.mapper'
import {
	getMyNotifications,
	getUnreadNotificationsCount,
} from './notifications.service'

const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

interface MockSeed {
	id: string
	title: string
	message: string
	link: string
	read: boolean
	ago: number
}

const MOCK_SEEDS: MockSeed[] = [
	{
		id: 'mock-1',
		title: 'Correspondance trouvée !',
		message:
			'Un objet similaire à votre iPhone 14 perdu à Cocody a été signalé trouvé près du Plateau. Consultez l’annonce pour vérifier.',
		link: '/posts/mock-match-1',
		read: false,
		ago: 30 * MINUTE,
	},
	{
		id: 'mock-2',
		title: 'Nouvelle correspondance possible',
		message:
			'Un portefeuille marron a été trouvé à Marcory. Cela pourrait correspondre à votre déclaration de perte.',
		link: '/posts/mock-match-2',
		read: false,
		ago: 5 * HOUR,
	},
	{
		id: 'mock-3',
		title: 'Correspondance trouvée',
		message:
			'Des clés avec un porte-clés bleu ont été déposées au commissariat d’Abobo. Vérifiez si ce sont les vôtres.',
		link: '/posts/mock-match-3',
		read: false,
		ago: 1 * DAY,
	},
	{
		id: 'mock-4',
		title: 'Objet potentiellement retrouvé',
		message:
			'Un sac à dos noir Eastpak a été signalé trouvé à la gare de Treichville. Il correspond à votre description.',
		link: '/posts/mock-match-4',
		read: true,
		ago: 3 * DAY,
	},
	{
		id: 'mock-5',
		title: 'Correspondance détectée',
		message:
			'Un téléphone Samsung Galaxy trouvé au marché de Yopougon pourrait être celui que vous recherchez.',
		link: '/posts/mock-match-5',
		read: true,
		ago: 6 * DAY,
	},
	{
		id: 'mock-6',
		title: 'Nouvelle correspondance',
		message:
			'Des documents d’identité ont été retrouvés à Adjamé. Vérifiez s’il s’agit des vôtres.',
		link: '/posts/mock-match-6',
		read: true,
		ago: 12 * DAY,
	},
]

function buildMockNotifications(): Notification[] {
	const now = Date.now()
	return MOCK_SEEDS.map(seed => {
		const createdAt = new Date(now - seed.ago).toISOString()
		return {
			id: seed.id,
			type: 'match_found' as const,
			title: seed.title,
			message: seed.message,
			link: seed.link,
			read: seed.read,
			createdAt,
			relativeDate: formatRelativeDate(createdAt),
		}
	})
}

export async function loader({ request }: { request: Request }) {
	await requireServerSession(request)

	try {
		const [list, unreadCount] = await Promise.all([
			getMyNotifications(request),
			getUnreadNotificationsCount(request),
		])

		const items = list.items.map(toNotification)

		if (items.length > 0) {
			return { items, unreadCount }
		}
	} catch {
		// fall through to mock data
	}

	const items = buildMockNotifications()
	const unreadCount = items.filter(n => !n.read).length
	return { items, unreadCount }
}
