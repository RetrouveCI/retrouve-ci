import type { IPostRepository } from '@/domain/repositories/post-repository'
import type { Post, PostStatus } from '@/domain/entities/post'
import { MOCK_POSTS } from '@/infrastructure/mock/data'

class MockPostRepository implements IPostRepository {
	private posts: Post[] = [...MOCK_POSTS]

	async getAll(): Promise<Post[]> {
		return [...this.posts]
	}

	async getById(id: number): Promise<Post | null> {
		return this.posts.find(p => p.id === id) ?? null
	}

	async updateStatus(id: number, status: PostStatus): Promise<void> {
		this.posts = this.posts.map(p =>
			p.id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p,
		)
	}

	async delete(id: number): Promise<void> {
		this.posts = this.posts.filter(p => p.id !== id)
	}
}

export const postRepository: IPostRepository = new MockPostRepository()
