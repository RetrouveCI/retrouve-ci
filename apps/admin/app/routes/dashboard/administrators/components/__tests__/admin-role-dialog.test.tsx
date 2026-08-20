import { createRoutesStub } from 'react-router'
import { page, render, userEvent } from '@/shared/helpers/testing'
import type { ActionResult } from '@/shared/types/action'
import { AdminRoleDialog } from '../admin-role-dialog'
import type { Admin } from '../../types/administrators.types'

const { success } = vi.hoisted(() => ({ success: vi.fn() }))

vi.mock('sonner', async importOriginal => ({
	...(await importOriginal<typeof import('sonner')>()),
	toast: { success },
}))

const moderator: Admin = {
	id: 'adm-1',
	name: 'Awa Koné',
	email: 'awa@retrouveci.com',
	phone: '+225 07 00 00 00 00',
	role: 'moderator',
	status: 'active',
	createdAt: '2026-08-01T10:00:00.000Z',
	lastLogin: null,
}

function renderDialog({
	action,
	admin = moderator,
	onOpenChange = () => {},
}: {
	action: (args: { request: Request }) => unknown
	admin?: Admin | null
	onOpenChange?: (open: boolean) => void
}) {
	const Stub = createRoutesStub([
		{
			path: '/administrators',
			Component: () => (
				<AdminRoleDialog open onOpenChange={onOpenChange} admin={admin} />
			),
			action,
		},
	])

	render(<Stub initialEntries={['/administrators']} />)
}

const role = () => page.getByRole('combobox', { name: /Rôle/ })
const submit = () => page.getByRole('button', { name: 'Mettre à jour' })

const ok = () => ({ success: true }) as ActionResult

beforeEach(() => {
	success.mockReset()
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('AdminRoleDialog', () => {
	it('shows the administrator read-only and prefills their current role', async () => {
		renderDialog({ action: ok })

		await expect.element(page.getByText('Modifier le rôle')).toBeInTheDocument()
		await expect.element(page.getByText('Awa Koné')).toBeInTheDocument()
		await expect
			.element(page.getByText('awa@retrouveci.com'))
			.toBeInTheDocument()
		await expect.element(role()).toHaveTextContent('Modérateur')
	})

	it('offers the role as the only editable field', async () => {
		renderDialog({ action: ok })

		expect(await page.getByRole('textbox').all()).toHaveLength(0)
		await expect.element(role()).toBeInTheDocument()
	})

	it('submits the update intent with the administrator id and the new role', async () => {
		const received: Record<string, string> = {}
		renderDialog({
			action: async ({ request }) => {
				for (const [key, value] of await request.formData()) {
					received[key] = String(value)
				}
				return ok()
			},
		})

		await userEvent.click(role())
		await userEvent.click(page.getByRole('option', { name: 'Administrateur' }))
		await userEvent.click(submit())

		await vi.waitFor(() => expect(received.intent).toBe('update'))
		expect(received.id).toBe('adm-1')
		expect(received.role).toBe('admin')
	})

	it('toasts and closes once the action succeeds', async () => {
		const onOpenChange = vi.fn()
		renderDialog({ action: ok, onOpenChange })

		await userEvent.click(submit())

		await vi.waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
		expect(success).toHaveBeenCalledWith('Rôle mis à jour')
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
							message: 'Le dernier administrateur ne peut être rétrogradé',
						},
					},
				}) as ActionResult,
		})

		await userEvent.click(submit())

		await expect
			.element(page.getByText('Impossible de mettre à jour le rôle'))
			.toBeInTheDocument()
		await expect
			.element(
				page.getByText('Le dernier administrateur ne peut être rétrogradé'),
			)
			.toBeInTheDocument()
		expect(onOpenChange).not.toHaveBeenCalledWith(false)
	})

	it('does not submit when there is no administrator to update', async () => {
		const action = vi.fn(ok)
		renderDialog({ action, admin: null })

		await userEvent.click(submit())

		await expect.element(role()).toBeInTheDocument()
		expect(action).not.toHaveBeenCalled()
	})
})
