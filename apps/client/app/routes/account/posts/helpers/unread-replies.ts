import type { UnreadReplies, UnreadThread } from '../types/thread'

export function toUnreadReplies(threads: UnreadThread[]): UnreadReplies {
	return Object.fromEntries(
		threads.map(thread => [thread.lostItemId, thread.unread]),
	)
}

export function unreadRepliesLabel(count: number): string {
	return count === 1
		? 'Nouveau message de l’équipe'
		: `${count} nouveaux messages de l’équipe`
}
