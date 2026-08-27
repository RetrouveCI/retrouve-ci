import { createRoutesStub } from 'react-router'
import { page, render, userEvent } from '@/shared/helpers/testing'
import type { ActionResult } from '@/shared/types/action'
import { AdminCreateDialog } from '../admin-create-dialog'

const { success } = vi.hoisted(() => ({ success: vi.fn() }))

// The `@app/ui/components` barrel pulls sonner's `Toaster` in, so the real
// module has to stay around — only `toast` is swapped.
vi.mock('sonner', async importOriginal => ({
	...(await importOriginal<typeof import('sonner')>()),
	toast: { success },
}))

function renderDialog({
	action,
	onOpenChange = () => {},
}: {
	action: (args: { request: Request }) => unknown
	onOpenChange?: (open: boolean) => void
}) {
	const Stub = createRoutesStub([
		{
			path: '/administrators',
			Component: () => <AdminCreateDialog open onOpenChange={onOpenChange} />,
			action,
		},
	])

	render(<Stub initialEntries={['/administrators']} />)
}

const name = () => page.getByLabelText(/^Nom complet/)
const email = () => page.getByLabelText(/^Email/)
const phone = () => page.getByLabelText(/^Téléphone/)
// `exact` matters: the eye toggle is labelled after its field, so a loose match
// would resolve to both the input and the button.
const password = () => page.getByLabelText('Mot de passe', { exact: true })
const role = () => page.getByRole('combobox', { name: /Rôle/ })
const submit = () => page.getByRole('button', { name: 'Créer le compte' })

async function fillValidAdmin() {
	await userEvent.fill(name(), 'Awa Koné')
	await userEvent.fill(email(), 'awa@retrouveci.com')
	await userEvent.fill(password(), 'Motdepasse1')
}

const ok = () => ({ success: true }) as ActionResult

async function readFormData(request: Request) {
	const received: Record<string, string> = {}
	for (const [key, value] of await request.formData()) {
		received[key] = String(value)
	}
	return received
}

beforeEach(() => {
	success.mockReset()
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('AdminCreateDialog', () => {
	it('renders every field, the role defaulting to moderator', async () => {
		renderDialog({ action: ok })

		await expect
			.element(page.getByText('Ajouter un administrateur'))
			.toBeInTheDocument()
		await expect.element(name()).toBeInTheDocument()
		await expect.element(email()).toBeInTheDocument()
		await expect.element(phone()).toBeInTheDocument()
		await expect.element(password()).toBeInTheDocument()
		await expect.element(role()).toHaveTextContent('Modérateur')
	})

	it('reports the schema messages without reaching the action', async () => {
		const action = vi.fn(ok)
		renderDialog({ action })

		await userEvent.click(submit())

		await expect
			.element(page.getByText('Minimum 2 caractères'))
			.toBeInTheDocument()
		await expect
			.element(page.getByText("L'email est requis"))
			.toBeInTheDocument()
		await expect
			.element(page.getByText('Au moins 8 caractères'))
			.toBeInTheDocument()
		expect(action).not.toHaveBeenCalled()
	})

	it('submits the create intent with the chosen role', async () => {
		let received: Record<string, string> = {}
		renderDialog({
			action: async ({ request }) => {
				received = await readFormData(request)
				return ok()
			},
		})

		await fillValidAdmin()
		await userEvent.click(role())
		await userEvent.click(page.getByRole('option', { name: 'Administrateur' }))
		await userEvent.click(submit())

		await vi.waitFor(() => expect(received.intent).toBe('create'))
		expect(received.name).toBe('Awa Koné')
		expect(received.email).toBe('awa@retrouveci.com')
		expect(received.role).toBe('admin')
		expect(received.phone).toBe('')
		expect(received.id).toBeUndefined()
	})

	it('toasts and closes once the action succeeds', async () => {
		const onOpenChange = vi.fn()
		renderDialog({ action: ok, onOpenChange })

		await fillValidAdmin()
		await userEvent.click(submit())

		await vi.waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
		expect(success).toHaveBeenCalledWith('Administrateur créé')
	})

	it('renders a root error and keeps the dialog open', async () => {
		const onOpenChange = vi.fn()
		renderDialog({
			onOpenChange,
			action: () =>
				({
					success: false,
					errors: {
						root: { type: 'custom', message: 'Cet email est déjà utilisé' },
					},
				}) as ActionResult,
		})

		await fillValidAdmin()
		await userEvent.click(submit())

		await expect
			.element(page.getByText("Impossible de créer l'administrateur"))
			.toBeInTheDocument()
		await expect
			.element(page.getByText('Cet email est déjà utilisé'))
			.toBeInTheDocument()
		expect(onOpenChange).not.toHaveBeenCalledWith(false)
		expect(success).not.toHaveBeenCalled()
	})

	it('lands a server-side field error on the field it belongs to', async () => {
		renderDialog({
			action: () =>
				({
					success: false,
					errors: {
						email: { type: 'custom', message: 'Email déjà enregistré' },
					},
				}) as ActionResult,
		})

		await fillValidAdmin()
		await userEvent.click(submit())

		await expect
			.element(page.getByText('Email déjà enregistré'))
			.toBeInTheDocument()
	})
})
