import type { BatchOutcome } from '@app/contracts/shared'
import { formatNumber } from '@app/contracts/shared'

interface BatchNoun {
	/** « annonce publiée » — the singular, already agreeing with the verb. */
	one: string
	/** « annonces publiées ». */
	many: string
}

/**
 * What the operator reads after a batch. Never a bare count of successes: a
 * « 3 sur 8 » that does not say what went wrong leaves them guessing, so the
 * distinct reasons are named — distinct, because twenty rows failing for one
 * reason is one thing to read, not twenty.
 *
 * Which rows failed is answered by the selection rather than by this sentence:
 * the ids mean nothing to a reader, so the page unticks what went through and
 * leaves the rest ticked. What stays selected *is* what did not go through.
 */
export function batchMessage(outcome: BatchOutcome, noun: BatchNoun): string {
	const done = outcome.succeeded.length
	const said = `${formatNumber(done)} ${done > 1 ? noun.many : noun.one}`

	if (outcome.failed.length === 0) return said

	const reasons = [...new Set(outcome.failed.map(item => item.reason))]

	return done === 0
		? `Aucune action effectuée — ${reasons.join(' · ')}`
		: `${said} · ${formatNumber(outcome.failed.length)} en échec — ${reasons.join(' · ')}`
}

/**
 * One action serves a page's single row and its selection alike, so what it
 * answers is a union and the page has to narrow it. `succeeded` is the shape's
 * own marker — no row of this backoffice carries a field by that name.
 */
export function isBatchOutcome(data: unknown): data is BatchOutcome {
	return (
		typeof data === 'object' &&
		data !== null &&
		Array.isArray((data as BatchOutcome).succeeded)
	)
}

/** A batch went through only when nothing in it failed. */
export function batchSucceeded(outcome: BatchOutcome): boolean {
	return outcome.failed.length === 0 && outcome.succeeded.length > 0
}
