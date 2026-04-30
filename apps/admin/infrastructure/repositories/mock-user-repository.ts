import type { IUserRepository } from '@/domain/repositories/user-repository'
import type { User, UserStatus } from '@/domain/entities/user'
import { MOCK_USERS } from '@/infrastructure/mock/data'

class MockUserRepository implements IUserRepository {
	private users: User[] = [...MOCK_USERS]

	async getAll(): Promise<User[]> {
		return [...this.users]
	}

	async getById(id: number): Promise<User | null> {
		return this.users.find(u => u.id === id) ?? null
	}

	async updateStatus(id: number, status: UserStatus): Promise<void> {
		this.users = this.users.map(u => (u.id === id ? { ...u, status } : u))
	}
}

export const userRepository: IUserRepository = new MockUserRepository()
