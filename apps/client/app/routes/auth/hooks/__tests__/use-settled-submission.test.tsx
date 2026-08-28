import { useState } from 'react'
import { page, render, userEvent } from '@/shared/helpers/testing'
import { useSettledSubmission } from '../use-settled-submission'

/**
 * Stands in for a fetcher: `answer` is what `fetcher.response` holds, and the
 * buttons reproduce the two sequences that broke the real forms.
 */
function Harness() {
	const [answer, setAnswer] = useState<unknown>(undefined)
	const [settled, setSettled] = useState(0)

	useSettledSubmission(answer, () => setSettled(count => count + 1))

	return (
		<>
			<p>settled {settled}</p>
			{/* A submission starting: still no answer, and the fetcher has not even
			    left `idle` yet. Nothing may be concluded from this. */}
			<button onClick={() => setAnswer(undefined)}>submit</button>
			<button onClick={() => setAnswer({ success: false })}>refuse</button>
			<button onClick={() => setAnswer({ success: true })}>accept</button>
			{/* React Router re-renders for reasons of its own; the same answer must
			    not be settled twice. */}
			<button onClick={() => setSettled(count => count)}>rerender</button>
		</>
	)
}

const settled = () => page.getByText(/^settled/)
const click = (name: string) =>
	userEvent.click(page.getByRole('button', { name }))

describe('useSettledSubmission', () => {
	// The measured bug: a flag raised beside `submit()` was read before the
	// request had started, and the empty fetcher was taken for a refusal.
	it('settles nothing until an answer arrives', async () => {
		render(<Harness />)

		await click('submit')
		await click('rerender')

		await expect.element(settled()).toHaveTextContent('settled 0')
	})

	it('settles once per answer, whatever it says', async () => {
		render(<Harness />)

		await click('refuse')
		await expect.element(settled()).toHaveTextContent('settled 1')

		await click('accept')
		await expect.element(settled()).toHaveTextContent('settled 2')
	})

	// Two refusals in a row are two answers, not one: the second must be seen.
	it('settles a repeated answer again', async () => {
		render(<Harness />)

		await click('refuse')
		await click('refuse')

		await expect.element(settled()).toHaveTextContent('settled 2')
	})

	it('does not settle the same answer on a re-render', async () => {
		render(<Harness />)

		await click('accept')
		await click('rerender')
		await click('rerender')

		await expect.element(settled()).toHaveTextContent('settled 1')
	})
})
