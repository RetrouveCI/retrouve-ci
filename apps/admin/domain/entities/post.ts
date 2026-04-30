export type PostStatus = 'pending' | 'published' | 'hidden'
export type PostType = 'lost' | 'found'

export interface Post {
	id: number
	title: string
	type: PostType
	description: string
	location: string
	date: string
	status: PostStatus
	authorId: number
	authorName: string
	image: string | null
	views: number
	contacts: number
	createdAt: string
	updatedAt: string
}
