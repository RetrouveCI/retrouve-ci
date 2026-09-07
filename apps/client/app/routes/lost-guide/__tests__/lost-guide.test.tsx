import { createRoutesStub } from 'react-router'
import { page, render } from '@/shared/helpers/testing'
import LostGuidePage, { meta } from '../_index'
import { FINDER_STEPS, GUIDE_STEPS } from '../lost-guide.const'

function renderGuide() {
	const Stub = createRoutesStub([
		{ path: '/objet-perdu-cote-divoire', Component: LostGuidePage },
	])
	render(<Stub initialEntries={['/objet-perdu-cote-divoire']} />)
}

describe('the lost-and-found guide', () => {
	it('states the subject in its heading', async () => {
		renderGuide()

		await expect
			.element(page.getByRole('heading', { level: 1 }))
			.toHaveTextContent(/perdu un objet ou un document en Côte d'Ivoire/)
	})

	// Anchored: one finder title is a prefix of the other.
	const heading = (title: string) =>
		page.getByRole('heading', {
			name: new RegExp(`${title.replaceAll('(', '\\(')}$`),
		})

	it('walks through every step, in order', async () => {
		renderGuide()

		for (const [index, step] of GUIDE_STEPS.entries()) {
			await expect
				.element(heading(step.title))
				.toHaveTextContent(`${index + 1}.`)
		}
	})

	it('addresses the finder too', async () => {
		renderGuide()

		for (const step of FINDER_STEPS) {
			await expect.element(heading(step.title)).toBeVisible()
		}
	})

	it('links each step to where it is done', async () => {
		renderGuide()

		for (const step of [...GUIDE_STEPS, ...FINDER_STEPS]) {
			if (!step.action || !step.to) continue

			await expect
				.element(page.getByRole('link', { name: step.action }))
				.toHaveAttribute('href', step.to)
		}
	})

	it('is indexable, and says what it is about', () => {
		const tags = meta() as { name?: string; content?: string }[]
		const named = tags.map(tag => tag.name)

		expect(named).not.toContain('robots')
		expect(tags.find(tag => tag.name === 'description')?.content).toMatch(
			/pièce d'identité|document/,
		)
	})
})

// ⚠️ The one step this repo cannot verify: it must stay free of invented
// specifics until a human confirms them.
describe('the step nobody here can verify', () => {
	const [administrative] = GUIDE_STEPS

	it('names the authorities without inventing a procedure', () => {
		expect(administrative?.body).toMatch(/commissariat|gendarmerie/)
		expect(administrative?.body).not.toMatch(
			/\d+\s*(?:F|FCFA|franc|jour|euro)/i,
		)
	})

	it('sends nobody to a page of ours for it', () => {
		expect(administrative?.to).toBeUndefined()
	})
})
