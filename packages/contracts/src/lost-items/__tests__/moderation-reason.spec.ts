import { describe, expect, it } from 'vitest'
import { MODERATION_REASONS } from '../lost-items.const'
import { moderationReasonSentence } from '../moderation-reason'

const WORDED = MODERATION_REASONS.filter(reason => reason !== 'other')

describe('moderationReasonSentence', () => {
	// A filtered `it.each` passes on an empty set, so the set is asserted first.
	it('leaves every reason but « Autre » to word', () => {
		expect(WORDED).toHaveLength(MODERATION_REASONS.length - 1)
	})

	// The whole point of storing a code: the same fault reads the same way.
	it.each(WORDED)('words %s without the moderator having to', reason => {
		const sentence = moderationReasonSentence({ reason })

		expect(sentence).toBeTruthy()
		expect(sentence).not.toMatch(/^[A-Z]/)
	})

	// « Autre » has no sentence of its own; the moderator wrote it.
	it('reads the note behind « Autre »', () => {
		expect(
			moderationReasonSentence({ reason: 'other', note: 'La 2e photo.' }),
		).toBe('La 2e photo.')
		expect(moderationReasonSentence({ reason: 'other' })).toBeNull()
		expect(moderationReasonSentence({ reason: 'other', note: null })).toBeNull()
	})

	// ⚠️ The artboard said « Modifiez-la pour republier », which the API does
	// not do — the lie R12 caught. Read on the card and in N2's notice alike.
	it('promises no return online', () => {
		for (const reason of MODERATION_REASONS) {
			const sentence = moderationReasonSentence({ reason, note: 'x' }) ?? ''

			expect(sentence).not.toMatch(/republi|remettre en ligne|reparaît/i)
		}
	})
})
