import type { User, UserStatus } from '@/domain/entities/user'

export interface IUserRepository {
	getAll(): Promise<User[]>
	getById(id: number): Promise<User | null>
	updateStatus(id: number, status: UserStatus): Promise<void>
}
