import { MODERATION_REASONS } from '@app/contracts/lost-items'
import {
	buildModerationNotice,
	moderationReasonSentence,
} from '../moderation-notice'

const moderation = (pending: number, hidden: number) => ({
	pending,
	hidden,
	published: 4,
})

describe('buildModerationNotice', () => {
	it('says nothing when every listing is published', () => {
		expect(buildModerationNotice(moderation(0, 0))).toBeNull()
	})

	it('counts the listings awaiting validation', () => {
		expect(buildModerationNotice(moderation(1, 0))).toEqual({
			title: '1 annonce en attente de validation',
			detail:
				"Elle n'est visible que de vous, jusqu'à ce qu'un modérateur la valide.",
		})
	})

	it('agrees the plural on both halves of the sentence', () => {
		expect(buildModerationNotice(moderation(3, 0))).toEqual({
			title: '3 annonces en attente de validation',
			detail:
				"Elles ne sont visibles que de vous, jusqu'à ce qu'un modérateur les valide.",
		})
	})

	/**
	 * R12 measured this: editing writes no moderation status, so a hidden listing
	 * that gets corrected stays hidden. The banner must not promise otherwise.
	 */
	it('does not promise that correcting a hidden listing republishes it', () => {
		expect(buildModerationNotice(moderation(0, 1))).toEqual({
			title: '1 annonce masquée par la modération',
			detail:
				"Elle n'est plus visible publiquement, et la corriger ne la remet pas en ligne.",
		})
	})

	it('agrees « masquées » in the plural', () => {
		expect(buildModerationNotice(moderation(0, 2))).toMatchObject({
			title: '2 annonces masquées par la modération',
		})
	})

	it('names both exceptions in one sentence', () => {
		expect(buildModerationNotice(moderation(1, 2))).toEqual({
			title: '1 annonce en attente de validation, 2 masquées',
			detail: "Aucune d'elles n'est visible publiquement.",
		})
	})
})

describe('moderationReasonSentence', () => {
	// The whole point of storing a code: the same fault reads the same way.
	it.each(MODERATION_REASONS.filter(reason => reason !== 'other'))(
		'words %s without the moderator having to',
		reason => {
			const sentence = moderationReasonSentence({ reason })

			expect(sentence).toBeTruthy()
			expect(sentence).not.toMatch(/^[A-Z]/)
		},
	)

	// « Autre » has no sentence of its own; the moderator wrote it.
	it('reads the note behind « Autre »', () => {
		expect(
			moderationReasonSentence({ reason: 'other', note: 'La 2e photo.' }),
		).toBe('La 2e photo.')
		expect(moderationReasonSentence({ reason: 'other' })).toBeNull()
	})

	// ⚠️ The artboard said « Modifiez-la pour republier », which the API does
	// not do — the lie R12 caught.
	it('promises no return online', () => {
		for (const reason of MODERATION_REASONS) {
			const sentence = moderationReasonSentence({ reason, note: 'x' }) ?? ''

			expect(sentence).not.toMatch(/republi|remettre en ligne|reparaît/i)
		}
	})
})
