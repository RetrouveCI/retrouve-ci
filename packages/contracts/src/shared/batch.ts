import { z } from 'zod'

/**
 * What one batch may carry. A ceiling, not a page size: the routes below run
 * their ids one at a time, so a larger batch would hold a request open for as
 * long as it takes — and an operator who means to act on more than fifty rows
 * means to change a filter, not to tick fifty boxes.
 */
export const MAX_BATCH_SIZE = 50

export const batchIdsSchema = z
	.array(z.string().min(1, 'Identifiant invalide'), {
		error: 'Sélectionnez au moins un élément',
	})
	.min(1, 'Sélectionnez au moins un élément')
	.max(MAX_BATCH_SIZE, `Maximum ${MAX_BATCH_SIZE} éléments à la fois`)

/**
 * What a batch answers. Never a bare count: a batch that half succeeded must
 * say **which** rows went through, or the operator has to guess what to retry.
 */
export interface BatchOutcome {
	succeeded: string[]
	failed: { id: string; reason: string }[]
}
