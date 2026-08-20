import { createRoutesStub } from 'react-router'
import { page, render, userEvent } from '@/shared/helpers/testing'
import type { ActionResult } from '@/shared/types/action'
import AdministratorsPage from '../_index'
import type { Admin } from '../types/administrators.types'

const { success, error } = vi.hoisted(() => ({
	success: vi.fn(),
	error: vi.fn(),
}))

vi.mock('sonner', async importOriginal => ({
	...(await importOriginal<typeof import('sonner')>()),
	toast: { success, error },
}))

const admins: Admin[] = [
	{
		id: 'adm-1',
		name: 'Awa Koné',
		email: 'awa@retrouveci.com',
		phone: '+225 07 00 00 00 00',
		role: 'moderator',
		status: 'active',
		createdAt: '2026-08-01T10:00:00.000Z',
		lastLogin: null,
	},
]

function renderPage(action: (args: { request: Request }) => unknown) {
	const Stub = createRoutesStub([
		{
			path: '/administrators',
			Component: AdministratorsPage,
			loader: () => ({ admins }),
			action,
		},
	])

	render(<Stub initialEntries={['/administrators']} />)
}

const rowMenu = () =>
	page.getByRole('button', { name: 'Actions pour Awa Koné' })
const ok = () => ({ success: true }) as ActionResult

beforeEach(() => {
	success.mockReset()
	error.mockReset()
})

afterEach(() => {
	vi.restoreAllMocks()
})

async function openDeleteDialog() {
	await userEvent.click(rowMenu())
	await userEvent.click(page.getByRole('menuitem', { name: /Supprimer/ }))
}

describe('AdministratorsPage', () => {
	it('lists the administrators the loader returned', async () => {
		renderPage(ok)

		await expect.element(page.getByText('Awa Koné')).toBeInTheDocument()
		await expect.element(page.getByText('Modérateur')).toBeInTheDocument()
		await expect
			.element(page.getByText('Actif', { exact: true }))
			.toBeInTheDocument()
	})

	it('names the administrator in the delete confirmation and submits the intent', async () => {
		const received: Record<string, string> = {}
		renderPage(async ({ request }) => {
			for (const [key, value] of await request.formData()) {
				received[key] = String(value)
			}
			return ok()
		})

		await openDeleteDialog()

		await expect
			.element(page.getByText("Supprimer l'administrateur ?"))
			.toBeInTheDocument()
		await userEvent.click(page.getByRole('button', { name: 'Supprimer' }))

		await vi.waitFor(() => expect(received.intent).toBe('delete'))
		expect(received.id).toBe('adm-1')
		await vi.waitFor(() =>
			expect(success).toHaveBeenCalledWith('Administrateur supprimé'),
		)
	})

	it('toasts the root error a failed deletion answers with', async () => {
		renderPage(
			() =>
				({
					success: false,
					errors: {
						root: {
							type: 'custom',
							message: 'Cet administrateur ne peut être supprimé',
						},
					},
				}) as ActionResult,
		)

		await openDeleteDialog()
		await userEvent.click(page.getByRole('button', { name: 'Supprimer' }))

		await vi.waitFor(() =>
			expect(error).toHaveBeenCalledWith(
				'Cet administrateur ne peut être supprimé',
			),
		)
		expect(success).not.toHaveBeenCalled()
	})

	it('closes the confirmation without submitting when cancelled', async () => {
		const action = vi.fn(ok)
		renderPage(action)

		await openDeleteDialog()
		await userEvent.click(page.getByRole('button', { name: 'Annuler' }))

		expect(action).not.toHaveBeenCalled()
	})
})
