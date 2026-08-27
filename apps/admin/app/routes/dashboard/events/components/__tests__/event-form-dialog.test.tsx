import { createRoutesStub } from 'react-router'
import { page, render, userEvent } from '@/shared/helpers/testing'
import type { ActionResult } from '@/shared/types/action'
import { EventFormDialog } from '../event-form-dialog'
import type { Event } from '../../types/events.types'

const existingEvent: Event = {
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

function renderDialog({
	action,
	event,
	onOpenChange = () => {},
}: {
	action: (args: { request: Request }) => unknown
	event?: Event | null
	onOpenChange?: (open: boolean) => void
}) {
	const Stub = createRoutesStub([
		{
			path: '/events',
			Component: () => (
				<EventFormDialog open onOpenChange={onOpenChange} event={event} />
			),
			action,
		},
	])

	render(<Stub initialEntries={['/events']} />)
}

const title = () => page.getByLabelText(/^Titre/)
const description = () => page.getByLabelText(/^Description/)
const location = () => page.getByLabelText(/^Lieu/)
const ville = () => page.getByLabelText(/^Ville/)
const commune = () => page.getByLabelText(/^Commune/)
const eventDate = () => page.getByLabelText(/^Date et heure/)

async function fillValidEvent() {
	await userEvent.fill(title(), 'Braderie du Plateau')
	await userEvent.fill(
		description(),
		'Une braderie solidaire ouverte à tous les habitants.',
	)
	await userEvent.fill(location(), 'Place de la République')
	await userEvent.fill(ville(), 'Abidjan')
	await userEvent.fill(eventDate(), '2026-09-01T18:30')
}

const ok = () => ({ success: true }) as ActionResult

describe('EventFormDialog', () => {
	it('renders every field in creation mode', async () => {
		renderDialog({ action: ok })

		await expect.element(page.getByText('Nouvel événement')).toBeInTheDocument()
		await expect.element(title()).toBeInTheDocument()
		await expect.element(description()).toBeInTheDocument()
		await expect.element(location()).toBeInTheDocument()
		await expect.element(ville()).toBeInTheDocument()
		await expect.element(commune()).toBeInTheDocument()
		await expect.element(eventDate()).toBeInTheDocument()
	})

	it('reports the schema messages without reaching the action', async () => {
		const action = vi.fn(ok)
		renderDialog({ action })

		await userEvent.click(page.getByRole('button', { name: 'Créer' }))

		await expect
			.element(page.getByText('Le titre doit contenir au moins 3 caractères'))
			.toBeInTheDocument()
		await expect
			.element(page.getByText('La date est requise'))
			.toBeInTheDocument()
		expect(action).not.toHaveBeenCalled()
	})

	it('submits the create intent with the entered values', async () => {
		const received: Record<string, string> = {}
		renderDialog({
			action: async ({ request }) => {
				for (const [key, value] of await request.formData()) {
					received[key] = String(value)
				}
				return ok()
			},
		})

		await fillValidEvent()
		await userEvent.click(page.getByRole('button', { name: 'Créer' }))

		await vi.waitFor(() => expect(received.intent).toBe('create'))
		expect(received.title).toBe('Braderie du Plateau')
		expect(received.ville).toBe('Abidjan')
		expect(received.id).toBeUndefined()
	})

	it('prefills the form and submits the update intent when editing', async () => {
		const received: Record<string, string> = {}
		renderDialog({
			event: existingEvent,
			action: async ({ request }) => {
				for (const [key, value] of await request.formData()) {
					received[key] = String(value)
				}
				return ok()
			},
		})

		await expect
			.element(page.getByText("Modifier l'événement"))
			.toBeInTheDocument()
		await expect.element(title()).toHaveValue('Braderie du Plateau')
		await expect.element(commune()).toHaveValue('Plateau')

		await userEvent.click(page.getByRole('button', { name: 'Mettre à jour' }))

		await vi.waitFor(() => expect(received.intent).toBe('update'))
		expect(received.id).toBe('evt-1')
	})

	it('closes the dialog once the action succeeds', async () => {
		const onOpenChange = vi.fn()
		renderDialog({ action: ok, onOpenChange })

		await fillValidEvent()
		await userEvent.click(page.getByRole('button', { name: 'Créer' }))

		await vi.waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
	})

	it('renders a root error and keeps the dialog open', async () => {
		const onOpenChange = vi.fn()
		renderDialog({
			onOpenChange,
			action: () =>
				({
					success: false,
					errors: {
						root: {
							type: 'custom',
							message: 'Un événement porte déjà ce titre',
						},
					},
				}) as ActionResult,
		})

		await fillValidEvent()
		await userEvent.click(page.getByRole('button', { name: 'Créer' }))

		await expect
			.element(page.getByText("Impossible de créer l'événement"))
			.toBeInTheDocument()
		await expect
			.element(page.getByText('Un événement porte déjà ce titre'))
			.toBeInTheDocument()
		expect(onOpenChange).not.toHaveBeenCalledWith(false)
	})

	it('lands a server-side field error on the field it belongs to', async () => {
		renderDialog({
			action: () =>
				({
					success: false,
					errors: {
						ville: { type: 'custom', message: 'Ville non desservie' },
					},
				}) as ActionResult,
		})

		await fillValidEvent()
		await userEvent.click(page.getByRole('button', { name: 'Créer' }))

		await expect
			.element(page.getByText('Ville non desservie'))
			.toBeInTheDocument()
	})
})
