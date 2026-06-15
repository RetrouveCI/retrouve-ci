import type { Admin, AdminRole, AdminStatus } from '@/domain/entities/admin'

export interface CreateAdminDto {
	name: string
	email: string
	phone: string
	role: AdminRole
}

export interface IAdminRepository {
	getAll(): Promise<Admin[]>
	getById(id: number): Promise<Admin | null>
	create(data: CreateAdminDto): Promise<Admin>
	update(id: number, data: Partial<CreateAdminDto>): Promise<Admin>
	updateStatus(id: number, status: AdminStatus): Promise<void>
	delete(id: number): Promise<void>
}
