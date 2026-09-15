import { cleanup, page, render } from '@/shared/helpers/testing'
import {
	ASSISTANT_OUTCOMES,
	type AssistantOutcome,
} from '@/routes/search/search.const'
import { AssistantBanner } from '../assistant-banner'

const PHRASE = "j'ai perdu ma carte d'identité à Cocody mardi"

/**
 * One word each, and no two of them share a banner. Asserting the markers
 * rather than the sentences is what keeps `empty` and `unavailable` from ever
 * converging — the pair F15 warned about — without pinning the wording.
 */
const MARKER: Record<AssistantOutcome, string> = {
	interpreted: 'retenu',
	empty: 'pas compris',
	unavailable: 'indisponible',
	throttled: 'Réessayez',
}

function mount(outcome: AssistantOutcome) {
	render(
		<AssistantBanner outcome={outcome} phrase={PHRASE} onDismiss={() => {}} />,
	)
}

/** A raw DOM read does not retry, so the mount is awaited through a locator. */
async function notice(): Promise<string> {
	const banner = page.getByRole('status')
	await expect.element(banner).toBeInTheDocument()

	return banner.element().textContent ?? ''
}

afterEach(() => cleanup())

describe('what the assistant says about a phrase', () => {
	it.each(ASSISTANT_OUTCOMES)('says its own thing on %s', async outcome => {
		mount(outcome)
		const said = await notice()

		expect(said).toContain(MARKER[outcome])

		// The gateway being off is not the model finding nothing to filter on:
		// one message for both would tell a visitor to rephrase what was fine,
		// or to wait out an outage that never ends.
		for (const other of ASSISTANT_OUTCOMES) {
			if (other !== outcome) expect(said).not.toContain(MARKER[other])
		}
	})

	it.each(ASSISTANT_OUTCOMES)('quotes the phrase back on %s', async outcome => {
		mount(outcome)

		// Never applied as a text search — a whole sentence matches no title — so
		// the banner is the only place the words survive the redirect.
		expect(await notice()).toContain(PHRASE)
	})

	it('can be dismissed', async () => {
		let dismissed = false
		render(
			<AssistantBanner
				outcome="interpreted"
				phrase={PHRASE}
				onDismiss={() => {
					dismissed = true
				}}
			/>,
		)

		await page.getByRole('button', { name: 'Masquer ce message' }).click()

		expect(dismissed).toBe(true)
	})
})
