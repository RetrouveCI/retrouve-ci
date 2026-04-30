import type { Post, PostStatus } from '@/domain/entities/post'

export interface IPostRepository {
	getAll(): Promise<Post[]>
	getById(id: number): Promise<Post | null>
	updateStatus(id: number, status: PostStatus): Promise<void>
	delete(id: number): Promise<void>
}
