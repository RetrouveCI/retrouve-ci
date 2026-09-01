import { cleanup, page, render } from '@/shared/helpers/testing'
import { useMediaQuery } from '../use-media-query'

function Probe({ query }: { query: string }) {
	return <p>{useMediaQuery(query) ? 'matched' : 'not matched'}</p>
}

afterEach(() => {
	cleanup()
})

describe('useMediaQuery', () => {
	it('answers false for a query no viewport satisfies', async () => {
		render(<Probe query="(min-width: 99999px)" />)

		await expect.element(page.getByText('not matched')).toBeInTheDocument()
	})

	it('answers true once mounted, for a query every viewport satisfies', async () => {
		render(<Probe query="(min-width: 1px)" />)

		await expect.element(page.getByText('matched')).toBeInTheDocument()
	})
})
