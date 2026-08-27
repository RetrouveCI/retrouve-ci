import { createRoutesStub } from 'react-router'
import { page, render, userEvent } from '@/shared/helpers/testing'
import type { ActionResult } from '@/shared/types/action'
import EventsPage from '../_index'
import type { Event } from '../types/events.types'

const { success, error } = vi.hoisted(() => ({
	success: vi.fn(),
	error: vi.fn(),
}))

vi.mock('sonner', async importOriginal => ({
	...(await importOriginal<typeof import('sonner')>()),
	toast: { success, error },
}))

const draft: Event = {
	id: 'evt-1',
	title: 'Braderie du Plateau',
	description: 'Une braderie solidaire ouverte à tous les habitants.',
	location: 'Place de la République',
	ville: 'Abidjan',
	commune: 'Plateau',
	eventDate: '2026-09-01T18:30:00.000Z',
	status: 'draft',
	createdAt: '2026-08-01T10:00:00.000Z',
	updatedAt: '2026-08-01T10:00:00.000Z',
}

function renderPage(action: (args: { request: Request }) => unknown) {
	const Stub = createRoutesStub([
		{
			path: '/events',
			Component: EventsPage,
			loader: () => ({ events: [draft], total: 1, statusFilter: 'all' }),
			action,
		},
	])

	render(<Stub initialEntries={['/events']} />)
}

const rowMenu = () =>
	page.getByRole('button', { name: 'Actions pour Braderie du Plateau' })
const ok = () => ({ success: true }) as ActionResult

beforeEach(() => {
	success.mockReset()
	error.mockReset()
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('EventsPage', () => {
	it('toasts once a deletion succeeds, though the dialog closes on click', async () => {
		const received: Record<string, string> = {}
		renderPage(async ({ request }) => {
			for (const [key, value] of await request.formData()) {
				received[key] = String(value)
			}
			return ok()
		})

		await userEvent.click(rowMenu())
		await userEvent.click(page.getByRole('menuitem', { name: /Supprimer/ }))
		await userEvent.click(page.getByRole('button', { name: 'Supprimer' }))

		await vi.waitFor(() => expect(received.intent).toBe('delete'))
		expect(received.id).toBe('evt-1')
		await vi.waitFor(() =>
			expect(success).toHaveBeenCalledWith('Événement supprimé'),
		)
	})

	it('toasts the status a publication reports back', async () => {
		const received: Record<string, string> = {}
		renderPage(async ({ request }) => {
			for (const [key, value] of await request.formData()) {
				received[key] = String(value)
			}
			return ok()
		})

		await userEvent.click(rowMenu())
		await userEvent.click(page.getByRole('menuitem', { name: 'Publier' }))

		await vi.waitFor(() => expect(received.intent).toBe('update-status'))
		expect(received.status).toBe('published')
		await vi.waitFor(() =>
			expect(success).toHaveBeenCalledWith('Événement mis à jour — Publié'),
		)
	})

	it('toasts the root error a failed deletion answers with', async () => {
		renderPage(
			() =>
				({
					success: false,
					errors: {
						root: { type: 'custom', message: 'Cet événement est verrouillé' },
					},
				}) as ActionResult,
		)

		await userEvent.click(rowMenu())
		await userEvent.click(page.getByRole('menuitem', { name: /Supprimer/ }))
		await userEvent.click(page.getByRole('button', { name: 'Supprimer' }))

		await vi.waitFor(() =>
			expect(error).toHaveBeenCalledWith('Cet événement est verrouillé'),
		)
		expect(success).not.toHaveBeenCalled()
	})
})
