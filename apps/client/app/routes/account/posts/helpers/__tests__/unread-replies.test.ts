import { toUnreadReplies, unreadRepliesLabel } from '../unread-replies'

describe('toUnreadReplies', () => {
	it('keys each count by the listing it belongs to', () => {
		expect(
			toUnreadReplies([
				{ lostItemId: 'post-1', unread: 2 },
				{ lostItemId: 'post-2', unread: 1 },
			]),
		).toEqual({ 'post-1': 2, 'post-2': 1 })
	})

	it('reads no thread as no message', () => {
		expect(toUnreadReplies([])).toEqual({})
	})
})

describe('unreadRepliesLabel', () => {
	it('names a single message', () => {
		expect(unreadRepliesLabel(1)).toBe('Nouveau message de l’équipe')
	})

	it('agrees several in the plural', () => {
		expect(unreadRepliesLabel(3)).toBe('3 nouveaux messages de l’équipe')
	})
})
