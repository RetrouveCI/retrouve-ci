import { createRoutesStub } from 'react-router'
import { cleanup, page, render } from '@/shared/helpers/testing'
import { SearchBar } from '@/components/search-bar'
import { ContactStep } from '@/routes/publish/components/contact-step'
import { PlaceStep } from '@/routes/publish/components/place-step'
import { ManualCodeForm } from '@/routes/scan/components/manual-code-form'
import { usePublishForm } from '@/routes/publish/hooks/use-publish-form'
import '../../app.css'

const FLOOR = 16

/** What the sibling source scan cannot see: the size Chromium computes. */
function fontSize(element: Element): number {
	return parseFloat(getComputedStyle(element).fontSize)
}

function PublishFields() {
	const { form } = usePublishForm()
	return (
		<div className="px-4">
			<ContactStep control={form.control} photoCount={1} />
			<PlaceStep control={form.control} type="lost" />
		</div>
	)
}

/** `SearchBar` posts through a router `Form`, and the steps read its state. */
function mount(children: React.ReactNode) {
	const Stub = createRoutesStub([
		{ path: '/', Component: () => <>{children}</> },
	])
	render(<Stub initialEntries={['/']} />)
}

afterEach(() => cleanup())

describe('every field the visitor types into', () => {
	// Raw inputs: no base component floors them, so they zoomed on their own.
	it.each([
		['07 00 00 00 00', 'the WhatsApp number'],
		['Ex : Konan', 'the poster name'],
	])('holds the floor on %s', async placeholder => {
		await page.viewport(390, 800)
		mount(<PublishFields />)
		await expect.element(page.getByPlaceholder(placeholder)).toBeInTheDocument()

		expect(fontSize(page.getByPlaceholder(placeholder).element())).toBe(FLOOR)
	})

	it('holds the floor on the sticker code', async () => {
		await page.viewport(390, 800)
		mount(<ManualCodeForm onCode={() => {}} />)
		await expect
			.element(page.getByPlaceholder('RCI-XXXXXX'))
			.toBeInTheDocument()

		expect(fontSize(page.getByPlaceholder('RCI-XXXXXX').element())).toBe(FLOOR)
	})

	// R37 floored `lg` alone: the header shows `xs`/`sm` from 768 px, which a
	// phone reaches in landscape, and `md` is what omitting the prop gives.
	it.each(['xs', 'sm', 'md', 'lg'] as const)(
		'holds the floor at size %s of the search bar',
		async size => {
			await page.viewport(390, 800)
			mount(<SearchBar mode="navigate" action="/posts" size={size} />)
			const field = page.getByRole('searchbox')
			await expect.element(field).toBeInTheDocument()

			expect(fontSize(field.element())).toBe(FLOOR)
		},
	)

	// A trigger cannot zoom, but it sits in the column the inputs do.
	it('holds the floor on the two selects of the place step', async () => {
		await page.viewport(390, 800)
		mount(<PublishFields />)
		await expect.element(page.getByLabelText(/Ville/)).toBeInTheDocument()

		for (const id of ['ville', 'commune'])
			expect(fontSize(document.getElementById(id)!), id).toBe(FLOOR)
	})
})
