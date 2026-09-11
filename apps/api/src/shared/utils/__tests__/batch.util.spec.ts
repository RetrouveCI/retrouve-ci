import { describe, expect, it, vi } from 'vitest'
import { settleBatch } from '../batch.util'

describe('settleBatch', () => {
	it('runs the action once per id and reports them all', async () => {
		const run = vi.fn().mockResolvedValue(undefined)

		await expect(settleBatch(['a', 'b', 'c'], run)).resolves.toEqual({
			succeeded: ['a', 'b', 'c'],
			failed: [],
		})
		expect(run).toHaveBeenCalledTimes(3)
	})

	// The rule the plan names: a batch that half succeeded must say which rows
	// went through, or the operator has to guess what to retry.
	it('names what succeeded and what did not', async () => {
		const run = vi.fn(async (id: string) => {
			if (id === 'b') throw new Error('Annonce introuvable')
		})

		await expect(settleBatch(['a', 'b', 'c'], run)).resolves.toEqual({
			succeeded: ['a', 'c'],
			failed: [{ id: 'b', reason: 'Annonce introuvable' }],
		})
	})

	// One row deleted in another tab must not take the rest of the batch down.
	it('carries on past a failure', async () => {
		const run = vi.fn(async (id: string) => {
			if (id === 'a') throw new Error('down')
		})

		const outcome = await settleBatch(['a', 'b'], run)

		expect(run).toHaveBeenCalledTimes(2)
		expect(outcome.succeeded).toEqual(['b'])
	})

	it('words a failure that carries no message', async () => {
		const run = vi.fn().mockRejectedValue('boom')

		const { failed } = await settleBatch(['a'], run)

		expect(failed).toEqual([{ id: 'a', reason: 'Erreur inconnue' }])
	})

	// Sequentially: these are writes that notify, and fifty at once would spend
	// the pool to save nobody any time.
	it('runs one at a time, in the order given', async () => {
		const seen: string[] = []
		const run = vi.fn(async (id: string) => {
			seen.push(`start:${id}`)
			await Promise.resolve()
			seen.push(`end:${id}`)
		})

		await settleBatch(['a', 'b'], run)

		expect(seen).toEqual(['start:a', 'end:a', 'start:b', 'end:b'])
	})

	it('answers an empty outcome for an empty selection', async () => {
		const run = vi.fn()

		await expect(settleBatch([], run)).resolves.toEqual({
			succeeded: [],
			failed: [],
		})
		expect(run).not.toHaveBeenCalled()
	})
})
