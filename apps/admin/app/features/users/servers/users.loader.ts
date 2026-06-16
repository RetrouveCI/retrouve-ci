import { requireAdminSession } from '@/shared/auth/auth.server'
import type { User, UserStatus } from '../users.types'

const MOCK_USERS: User[] = [
	{
		id: 'u-001',
		name: 'Kouamé Yao',
		email: 'kouame.yao@example.com',
		phone: '+225 07 01 02 03 04',
		avatar: null,
		status: 'active',
		createdAt: '2024-01-12T10:30:00Z',
		qrCodesCount: 2,
		postsCount: 1,
	},
	{
		id: 'u-002',
		name: 'Aminata Diallo',
		email: 'aminata.d@example.com',
		phone: '+225 05 12 34 56 78',
		avatar: null,
		status: 'active',
		createdAt: '2024-01-15T14:20:00Z',
		qrCodesCount: 3,
		postsCount: 2,
	},
	{
		id: 'u-003',
		name: 'Jean-Paul Konan',
		email: 'jp.konan@example.com',
		phone: '+225 01 23 45 67 89',
		avatar: null,
		status: 'active',
		createdAt: '2024-01-20T09:00:00Z',
		qrCodesCount: 1,
		postsCount: 0,
	},
	{
		id: 'u-004',
		name: 'Fatou Traoré',
		email: 'fatou.t@example.com',
		phone: '+225 07 89 10 11 12',
		avatar: null,
		status: 'inactive',
		createdAt: '2024-02-01T16:45:00Z',
		qrCodesCount: 0,
		postsCount: 1,
	},
	{
		id: 'u-005',
		name: 'Moussa Coulibaly',
		email: 'm.coulibaly@example.com',
		phone: '+225 05 34 56 78 90',
		avatar: null,
		status: 'active',
		createdAt: '2024-02-10T11:30:00Z',
		qrCodesCount: 4,
		postsCount: 3,
	},
	{
		id: 'u-006',
		name: 'Aïcha Bamba',
		email: 'aicha.bamba@example.com',
		phone: '+225 01 56 78 90 12',
		avatar: null,
		status: 'active',
		createdAt: '2024-02-18T08:20:00Z',
		qrCodesCount: 2,
		postsCount: 0,
	},
	{
		id: 'u-007',
		name: 'Serge Akissi',
		email: 's.akissi@example.com',
		phone: '+225 07 23 45 67 01',
		avatar: null,
		status: 'inactive',
		createdAt: '2024-03-05T13:10:00Z',
		qrCodesCount: 1,
		postsCount: 2,
	},
]

export { MOCK_USERS }

const VALID_STATUSES: UserStatus[] = ['active', 'inactive']

export async function usersLoader({ request }: { request: Request }) {
	await requireAdminSession(request)

	const url = new URL(request.url)
	const rawStatus = url.searchParams.get('status')
	const statusFilter = VALID_STATUSES.includes(rawStatus as UserStatus)
		? (rawStatus as UserStatus)
		: undefined

	const users = statusFilter
		? MOCK_USERS.filter((u) => u.status === statusFilter)
		: MOCK_USERS

	return {
		users,
		total: MOCK_USERS.length,
		statusFilter: rawStatus ?? 'all',
	}
}
