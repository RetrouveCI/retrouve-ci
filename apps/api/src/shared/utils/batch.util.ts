import type { BatchOutcome } from '@app/contracts/shared'

/**
 * Runs one action over a selection and reports, row by row, what became of it.
 *
 * Two decisions live here so no route repeats them. A failure does **not** stop
 * the batch: an operator who ticked twenty rows wants the nineteen that can go
 * through to go through, and one row deleted in another tab must not take the
 * others with it. And the answer names the ids rather than counting them — a
 * silent « 3 sur 8 » is worse than not offering the batch at all, because the
 * operator has no way to know which five to retry.
 *
 * Sequentially, on purpose: these are writes that notify, and fifty at once
 * would spend the connection pool to save an operator no time at all.
 */
export async function settleBatch(
	ids: readonly string[],
	run: (id: string) => Promise<unknown>,
): Promise<BatchOutcome> {
	const outcome: BatchOutcome = { succeeded: [], failed: [] }

	for (const id of ids) {
		try {
			await run(id)
			outcome.succeeded.push(id)
		} catch (error) {
			outcome.failed.push({ id, reason: reasonOf(error) })
		}
	}

	return outcome
}

/** What the operator reads back. A domain error already words itself. */
function reasonOf(error: unknown): string {
	return error instanceof Error && error.message
		? error.message
		: 'Erreur inconnue'
}
