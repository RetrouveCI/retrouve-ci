import { requireAdminSession } from '@/shared/auth/auth.server'
import type { Admin } from '../administrators.types'

export const MOCK_ADMINS: Admin[] = [
	{
		id: 'a-001',
		name: 'Joël Digbeu',
		email: 'admin@retrouveci.com',
		phone: '+225 07 00 00 00 01',
		role: 'super_admin',
		status: 'active',
		createdAt: '2024-01-01T00:00:00Z',
		lastLogin: '2026-06-15T08:30:00Z',
	},
	{
		id: 'a-002',
		name: 'Marie Konan',
		email: 'marie.konan@retrouveci.com',
		phone: '+225 05 11 22 33 44',
		role: 'admin',
		status: 'active',
		createdAt: '2024-02-10T09:00:00Z',
		lastLogin: '2026-06-14T14:20:00Z',
	},
	{
		id: 'a-003',
		name: 'Serge Ouattara',
		email: 's.ouattara@retrouveci.com',
		phone: '+225 01 55 66 77 88',
		role: 'moderator',
		status: 'active',
		createdAt: '2024-03-15T11:00:00Z',
		lastLogin: '2026-06-13T10:45:00Z',
	},
	{
		id: 'a-004',
		name: 'Carine Brou',
		email: 'c.brou@retrouveci.com',
		phone: '+225 07 99 00 11 22',
		role: 'moderator',
		status: 'inactive',
		createdAt: '2024-04-01T14:00:00Z',
		lastLogin: null,
	},
]

export async function administratorsLoader({ request }: { request: Request }) {
	await requireAdminSession(request)
	return { admins: MOCK_ADMINS }
}
