import type { UnreadReplies, UnreadThread } from '../types/posts.types'

export function toUnreadReplies(threads: UnreadThread[]): UnreadReplies {
	return Object.fromEntries(
		threads.map(thread => [thread.lostItemId, thread.unread]),
	)
}

export function unreadRepliesLabel(count: number): string {
	return count === 1 ? 'Nouvelle réponse' : `${count} réponses`
}
