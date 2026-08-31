import { createRoutesStub } from 'react-router'
import { cleanup, page, render } from '@/shared/helpers/testing'
import { PostGallery } from '../post-gallery'

const PHOTO = 'https://res.cloudinary.com/retrouveci/image/upload/v1/a.jpg'

function renderGallery(images: string[]) {
	const Stub = createRoutesStub([
		{
			path: '/',
			Component: () => <PostGallery images={images} title="Tecno Spark" />,
		},
	])
	render(<Stub initialEntries={['/']} />)
}

const slide = (n: number) => page.getByLabelText(`Agrandir la photo ${n}`)

afterEach(cleanup)

describe('the gallery', () => {
	/**
	 * The swipe is the browser's own scroll-snap and the dots are `aria-hidden`
	 * indicators, so what a test without a layout can hold on to is the slides:
	 * every photo is a named button, which is how the track stays navigable by
	 * keyboard and by screen reader.
	 */
	it('makes each photo a named slide of its own', async () => {
		renderGallery([PHOTO, PHOTO, PHOTO])

		await expect.element(slide(1)).toBeVisible()
		await expect.element(slide(3)).toBeVisible()
		expect(
			await page.getByLabelText(/Agrandir la photo/).elements(),
		).toHaveLength(3)
	})

	it('opens the lightbox on the slide that was tapped', async () => {
		renderGallery([PHOTO, PHOTO])
		await slide(1).click()

		await expect.element(page.getByLabelText('Fermer')).toBeVisible()
		await expect.element(page.getByLabelText('Photo suivante')).toBeVisible()
	})

	it('draws no next/previous control for a single photo', async () => {
		renderGallery([PHOTO])
		await slide(1).click()

		await expect.element(page.getByLabelText('Fermer')).toBeVisible()
		expect(await page.getByLabelText('Photo suivante').elements()).toHaveLength(
			0,
		)
	})

	it('falls back to a placeholder when the listing has no photo', async () => {
		renderGallery([])

		expect(await page.getByRole('button').elements()).toHaveLength(0)
	})
})
