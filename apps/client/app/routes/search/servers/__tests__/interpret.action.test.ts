import { ApiError } from '@/shared/utils/api-fetch'
import type { SearchInterpretation } from '@app/contracts/search-assistant'

const { interpretSearchPhrase } = vi.hoisted(() => ({
	interpretSearchPhrase: vi.fn(),
}))

vi.mock('../interpret.service', () => ({ interpretSearchPhrase }))

const { action, loader } = await import('../interpret.action')

const PHRASE = "j'ai perdu ma carte d'identité à Cocody mardi"

const submit = (phrase: string) => {
	const body = new FormData()
	body.set('phrase', phrase)

	return action({
		request: new Request('http://localhost:3000/search', {
			method: 'POST',
			body,
		}),
	})
}

const landing = async (phrase: string) => {
	const response = await submit(phrase)
	const location = response.headers.get('Location') ?? ''

	return new URL(location, 'http://localhost:3000')
}

const answers = (interpretation: SearchInterpretation) =>
	interpretSearchPhrase.mockResolvedValue(interpretation)

beforeEach(() => {
	interpretSearchPhrase.mockReset()
	answers({ status: 'interpreted', filters: {} })
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('the search assistant action', () => {
	it('turns the filters into the listing URL the visitor could have built', async () => {
		answers({
			status: 'interpreted',
			filters: {
				type: 'lost',
				category: 'documents',
				ville: 'Abidjan',
				commune: 'Cocody',
				dateFrom: '2026-09-08',
				search: 'carte',
			},
		})

		const url = await landing(PHRASE)

		expect(url.pathname).toBe('/posts')
		expect(Object.fromEntries(url.searchParams)).toEqual({
			type: 'lost',
			category: 'documents',
			ville: 'Abidjan',
			commune: 'Cocody',
			dateFrom: '2026-09-08',
			// The one key the URL spells differently from the contract.
			q: 'carte',
			assistant: 'interpreted',
			phrase: PHRASE,
		})
	})

	// F15's warning: the gateway being off is not the model finding nothing.
	it('tells an empty interpretation apart from an unavailable gateway', async () => {
		answers({ status: 'interpreted', filters: {} })
		expect((await landing(PHRASE)).searchParams.get('assistant')).toBe('empty')

		answers({ status: 'unavailable', filters: {} })
		expect((await landing(PHRASE)).searchParams.get('assistant')).toBe(
			'unavailable',
		)
	})

	it('names the throttle apart, being the one worth waiting out', async () => {
		interpretSearchPhrase.mockRejectedValue(new ApiError(429, 'Trop'))

		expect((await landing(PHRASE)).searchParams.get('assistant')).toBe(
			'throttled',
		)
	})

	it.each([400, 500])('folds a %i into the repli', async status => {
		interpretSearchPhrase.mockRejectedValue(new ApiError(status, 'boom'))

		expect((await landing(PHRASE)).searchParams.get('assistant')).toBe(
			'unavailable',
		)
	})

	it('folds a non-API failure into it too', async () => {
		interpretSearchPhrase.mockRejectedValue(new Error('network down'))

		expect((await landing(PHRASE)).searchParams.get('assistant')).toBe(
			'unavailable',
		)
	})

	// The sentence is quoted back by the banner, never applied as a text search:
	// a whole sentence matches no title, and an empty list is a worse answer.
	it.each(['empty', 'unavailable'] as const)(
		'keeps the phrase out of `q` on %s',
		async outcome => {
			if (outcome === 'empty') answers({ status: 'interpreted', filters: {} })
			else answers({ status: 'unavailable', filters: {} })

			const url = await landing(PHRASE)

			expect(url.searchParams.get('q')).toBeNull()
			expect(url.searchParams.get('phrase')).toBe(PHRASE)
		},
	)

	it('spends nothing on a keyword and searches it as text', async () => {
		const url = await landing('CNI Cocody')

		expect(interpretSearchPhrase).not.toHaveBeenCalled()
		expect(Object.fromEntries(url.searchParams)).toEqual({ q: 'CNI Cocody' })
	})

	it('sends an empty submission to the plain listing', async () => {
		const url = await landing('   ')

		expect(interpretSearchPhrase).not.toHaveBeenCalled()
		expect(url.search).toBe('')
	})

	// Without it the rate limiter keys the bucket on this container, and five
	// phrases a quarter of an hour become five for every visitor at once.
	it('hands the request over', async () => {
		await submit(PHRASE)

		expect(interpretSearchPhrase).toHaveBeenCalledWith(
			PHRASE,
			expect.any(Request),
		)
	})

	// No component means no error boundary: a GET used to render a 400 JSON page.
	it('answers a GET with the listing', () => {
		const response = loader()

		expect(response.status).toBe(302)
		expect(response.headers.get('Location')).toBe('/posts')
	})
})
