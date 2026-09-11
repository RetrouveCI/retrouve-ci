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

	it('reads no thread as no reply', () => {
		expect(toUnreadReplies([])).toEqual({})
	})
})

describe('unreadRepliesLabel', () => {
	it('names a single reply', () => {
		expect(unreadRepliesLabel(1)).toBe('Nouvelle réponse')
	})

	it('counts several', () => {
		expect(unreadRepliesLabel(3)).toBe('3 réponses')
	})
})
