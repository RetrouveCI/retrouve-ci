import { useState } from 'react'
import { page, render, userEvent } from '@/shared/helpers/testing'
import type { ActionResult } from '@/shared/types/action'
import { useSettledSubmission } from '../use-settled-submission'

const REFUSED: ActionResult = {
	success: false,
	errors: { root: { type: 'custom', message: 'Code expiré' } },
}

/**
 * Stands in for a fetcher: `answer` is what `fetcher.response` holds, and the
 * buttons reproduce the sequences that broke the real forms.
 */
function Harness() {
	const [answer, setAnswer] = useState<ActionResult | undefined>(undefined)
	const [log, setLog] = useState<string[]>([])

	useSettledSubmission(answer, result =>
		setLog(entries => [...entries, result.success ? 'ok' : 'ko']),
	)

	return (
		<>
			<p>log [{log.join(',')}]</p>
			{/* A submission starting: no answer yet, and the fetcher has not even
			    left `idle`. Nothing may be concluded from this. */}
			<button onClick={() => setAnswer(undefined)}>submit</button>
			<button onClick={() => setAnswer({ ...REFUSED })}>refuse</button>
			<button onClick={() => setAnswer({ success: true })}>accept</button>
			{/* React Router re-renders for reasons of its own; the same answer must
			    not be settled twice. */}
			<button onClick={() => setLog(entries => [...entries])}>rerender</button>
		</>
	)
}

const log = () => page.getByText(/^log/)
const click = (name: string) =>
	userEvent.click(page.getByRole('button', { name }))

describe('useSettledSubmission', () => {
	// The measured bug: a flag raised beside `submit()` was read before the
	// request had started, and the empty fetcher was taken for a refusal.
	it('settles nothing until an answer arrives', async () => {
		render(<Harness />)

		await click('submit')
		await click('rerender')

		await expect.element(log()).toHaveTextContent('log []')
	})

	// The second measured bug: the branch used to ask the fetcher whether it was
	// `isOk`, which also means "idle" — and it is not idle when its answer lands,
	// so every successful reset was reported as a refused code. The answer that
	// settled is what decides.
	it('reports what the answer says, not what the fetcher is doing', async () => {
		render(<Harness />)

		await click('accept')
		await expect.element(log()).toHaveTextContent('log [ok]')

		await click('refuse')
		await expect.element(log()).toHaveTextContent('log [ok,ko]')
	})

	// Two refusals in a row are two answers, not one: the second must be seen.
	it('settles a repeated answer again', async () => {
		render(<Harness />)

		await click('refuse')
		await click('refuse')

		await expect.element(log()).toHaveTextContent('log [ko,ko]')
	})

	it('does not settle the same answer on a re-render', async () => {
		render(<Harness />)

		await click('accept')
		await click('rerender')
		await click('rerender')

		await expect.element(log()).toHaveTextContent('log [ok]')
	})
})
