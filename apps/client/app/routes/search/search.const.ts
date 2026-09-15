/**
 * Four outcomes, four sentences. `unavailable` and `empty` are the pair F15
 * warned about: the gateway being off, out of budget or unreachable is **not**
 * the same as the model reading the phrase and finding nothing to filter on,
 * and one message for both would tell the visitor to rephrase a sentence that
 * was fine, or to wait out an outage that never ends.
 *
 * `throttled` is named apart for the reason `posts/:id/contact` names it apart:
 * it is the only one worth waiting out.
 */
export const ASSISTANT_OUTCOMES = [
	'interpreted',
	'empty',
	'unavailable',
	'throttled',
] as const

export type AssistantOutcome = (typeof ASSISTANT_OUTCOMES)[number]

/** Where the outcome and the words travel: the URL, so a reload keeps them. */
export const ASSISTANT_PARAM = 'assistant'
export const PHRASE_PARAM = 'phrase'

export function toAssistantOutcome(
	value: string | null,
): AssistantOutcome | undefined {
	return ASSISTANT_OUTCOMES.find(outcome => outcome === value)
}
