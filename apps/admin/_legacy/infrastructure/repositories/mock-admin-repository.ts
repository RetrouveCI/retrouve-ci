import type {
	IAdminRepository,
	CreateAdminDto,
} from '@/domain/repositories/admin-repository'
import type { Admin, AdminStatus } from '@/domain/entities/admin'
import { MOCK_ADMINS } from '@/infrastructure/mock/data'

class MockAdminRepository implements IAdminRepository {
	private admins: Admin[] = [...MOCK_ADMINS]

	async getAll(): Promise<Admin[]> {
		return [...this.admins]
	}

	async getById(id: number): Promise<Admin | null> {
		return this.admins.find(a => a.id === id) ?? null
	}

	async create(data: CreateAdminDto): Promise<Admin> {
		const newAdmin: Admin = {
			id: Math.max(...this.admins.map(a => a.id)) + 1,
			...data,
			status: 'active',
			createdAt: new Date().toISOString(),
			lastLogin: null,
		}
		this.admins = [...this.admins, newAdmin]
		return newAdmin
	}

	async update(id: number, data: Partial<CreateAdminDto>): Promise<Admin> {
		let updated: Admin | undefined
		this.admins = this.admins.map(a => {
			if (a.id !== id) return a
			updated = { ...a, ...data }
			return updated
		})
		if (!updated) throw new Error(`Admin ${id} not found`)
		return updated
	}

	async updateStatus(id: number, status: AdminStatus): Promise<void> {
		this.admins = this.admins.map(a => (a.id === id ? { ...a, status } : a))
	}

	async delete(id: number): Promise<void> {
		this.admins = this.admins.filter(a => a.id !== id)
	}
}

export const adminRepository: IAdminRepository = new MockAdminRepository()
