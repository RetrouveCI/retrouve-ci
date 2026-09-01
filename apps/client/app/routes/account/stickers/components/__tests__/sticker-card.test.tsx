import { createRoutesStub } from 'react-router'
import {
	cleanup,
	page,
	render,
	stopAnimations,
	userEvent,
} from '@/shared/helpers/testing'
import type { ActionResult } from '@/shared/types/action'
import type { Sticker } from '@/shared/types/sticker'
import { StickerCard } from '../sticker-card'

const { success, error } = vi.hoisted(() => ({
	success: vi.fn(),
	error: vi.fn(),
}))

vi.mock('sonner', async importOriginal => ({
	...(await importOriginal<typeof import('sonner')>()),
	toast: { success, error },
}))

const STICKER: Sticker = {
	id: 'qr-1',
	code: 'RCI-4A7F-2K91',
	status: 'activated',
	isActive: true,
	label: 'Clés de la maison',
	linkedObject: 'Trousseau avec porte-clés bleu',
	activatedAt: '2026-08-14T10:00:00.000Z',
}

type Action = (args: { request: Request }) => unknown

function renderCard(
	sticker: Partial<Sticker> = {},
	action: Action = async () => ({ success: true }) as ActionResult,
) {
	const Stub = createRoutesStub([
		{
			path: '/account/stickers',
			Component: () => <StickerCard sticker={{ ...STICKER, ...sticker }} />,
			action: action as never,
		},
	])
	render(<Stub initialEntries={['/account/stickers']} />)
}

beforeEach(() => {
	stopAnimations()
	success.mockReset()
	error.mockReset()
})

afterEach(() => {
	cleanup()
	vi.restoreAllMocks()
})

describe('StickerCard', () => {
	it('names the sticker and when it was activated', async () => {
		renderCard()

		await expect
			.element(page.getByText('Clés de la maison'))
			.toBeInTheDocument()
		await expect
			.element(page.getByText(/RCI-4A7F-2K91 · activé le 14 août/))
			.toBeInTheDocument()
	})

	it('draws no badge on an active sticker, which is the normal case', async () => {
		renderCard()

		await expect.element(page.getByText('Clés de la maison')).toBeVisible()
		expect(page.getByText('En attente').elements()).toHaveLength(0)
		expect(page.getByText('Désactivé').elements()).toHaveLength(0)
	})

	it('says what to do with a sticker that is only generated', async () => {
		renderCard({
			status: 'generated',
			isActive: false,
			label: null,
			linkedObject: null,
			activatedAt: null,
		})

		await expect
			.element(page.getByText('Sticker non activé'))
			.toBeInTheDocument()
		await expect
			.element(page.getByText('Activez-le pour le nommer'))
			.toBeInTheDocument()
		await expect.element(page.getByText('En attente')).toBeInTheDocument()
	})

	it('offers no menu on a sticker that cannot be acted on', async () => {
		renderCard({ status: 'generated', isActive: false })

		await expect.element(page.getByText('Clés de la maison')).toBeVisible()
		expect(
			page.getByRole('button', { name: /Actions sur/ }).elements(),
		).toEqual([])
	})

	it('marks a revoked sticker as such', async () => {
		renderCard({ status: 'revoked', isActive: false })

		await expect.element(page.getByText('Désactivé')).toBeInTheDocument()
	})

	it('confirms before revoking, and reports what the action answered', async () => {
		const action = vi.fn(async () => ({ success: true }) as ActionResult)
		renderCard({}, action)

		await userEvent.click(page.getByRole('button', { name: /Actions sur/ }))
		await userEvent.click(
			page.getByRole('button', { name: 'Désactiver le sticker' }),
		)

		await expect
			.element(page.getByText('Désactiver ce sticker ?'))
			.toBeInTheDocument()
		expect(action).not.toHaveBeenCalled()

		await userEvent.click(page.getByRole('button', { name: 'Désactiver' }))

		await vi.waitFor(() =>
			expect(success).toHaveBeenCalledWith('Sticker désactivé'),
		)
	})

	it('reports the root error a failed revocation answers with', async () => {
		renderCard({}, async () => ({
			success: false,
			errors: { root: { message: 'Sticker introuvable' } },
		}))

		await userEvent.click(page.getByRole('button', { name: /Actions sur/ }))
		await userEvent.click(
			page.getByRole('button', { name: 'Désactiver le sticker' }),
		)
		await userEvent.click(page.getByRole('button', { name: 'Désactiver' }))

		await vi.waitFor(() =>
			expect(error).toHaveBeenCalledWith('Sticker introuvable'),
		)
	})
})
