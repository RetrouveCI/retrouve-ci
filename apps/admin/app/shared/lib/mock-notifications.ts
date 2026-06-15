export type NotificationType = 'order' | 'user' | 'post' | 'qr' | 'system'

export interface Notification {
	id: number
	type: NotificationType
	title: string
	message: string
	read: boolean
	createdAt: string
	link: string | null
	meta?: {
		userId?: number
		orderId?: string
		postId?: number
		token?: string
	}
}

export const MOCK_NOTIFICATIONS: Notification[] = [
	{
		id: 1,
		type: 'order',
		title: 'Nouvelle commande de stickers',
		message: 'Moussa Traoré a passé une commande de 2 stickers.',
		read: false,
		createdAt: '2024-02-18T17:45:00Z',
		link: '/orders',
		meta: { orderId: 'CMD-2024-004' },
	},
	{
		id: 2,
		type: 'order',
		title: 'Nouvelle commande de stickers',
		message: 'Ibrahim Koné a passé une commande de 7 stickers.',
		read: false,
		createdAt: '2024-03-05T14:30:00Z',
		link: '/orders',
		meta: { orderId: 'CMD-2024-007' },
	},
	{
		id: 3,
		type: 'post',
		title: 'Nouveau post en attente',
		message:
			'Un post "Objet perdu : Téléphone Samsung" est en attente de modération.',
		read: false,
		createdAt: '2024-03-08T09:15:00Z',
		link: '/posts',
		meta: { postId: 4 },
	},
	{
		id: 4,
		type: 'user',
		title: 'Nouvel utilisateur inscrit',
		message: 'Kouamé Yao vient de créer un compte sur la plateforme.',
		read: true,
		createdAt: '2024-01-12T10:30:00Z',
		link: '/users/1',
		meta: { userId: 1 },
	},
	{
		id: 5,
		type: 'qr',
		title: 'QR Code activé',
		message: 'Le token QR-2024-BATCH1-001 a été activé par Aminata Diallo.',
		read: true,
		createdAt: '2024-01-20T11:00:00Z',
		link: '/qr',
		meta: { token: 'QR-2024-BATCH1-001' },
	},
	{
		id: 6,
		type: 'order',
		title: 'Commande expédiée',
		message:
			"La commande CMD-2024-002 d'Aminata Diallo a été marquée comme expédiée.",
		read: true,
		createdAt: '2024-02-05T11:30:00Z',
		link: '/orders',
		meta: { orderId: 'CMD-2024-002' },
	},
	{
		id: 7,
		type: 'system',
		title: 'Mise à jour système',
		message:
			'La plateforme RetrouveCI a été mise à jour vers la version 2.1.0.',
		read: true,
		createdAt: '2024-01-30T08:00:00Z',
		link: null,
		meta: {},
	},
	{
		id: 8,
		type: 'post',
		title: 'Post signalé',
		message: 'Le post "Sac trouvé à Cocody" a été signalé par un utilisateur.',
		read: false,
		createdAt: '2024-03-10T16:20:00Z',
		link: '/posts',
		meta: { postId: 2 },
	},
	{
		id: 9,
		type: 'qr',
		title: 'QR Code révoqué',
		message: "Le token QR-2024-BATCH2-003 a été révoqué par l'administrateur.",
		read: true,
		createdAt: '2024-02-14T13:00:00Z',
		link: '/qr',
		meta: { token: 'QR-2024-BATCH2-003' },
	},
	{
		id: 10,
		type: 'user',
		title: 'Compte désactivé',
		message: "Le compte d'Ibrahim Koné a été désactivé.",
		read: true,
		createdAt: '2024-02-28T10:00:00Z',
		link: '/users/3',
		meta: { userId: 3 },
	},
]
