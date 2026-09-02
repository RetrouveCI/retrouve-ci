import { createRoutesStub } from 'react-router'
import { ASSIGNABLE_PHONE_ERROR_MESSAGE } from '@/shared/utils/phone'
import { page, render, userEvent } from '@/shared/helpers/testing'
import type { ActionResult } from '@/shared/types/action'
import QrContactPage from '../_index'
import type { QrTokenPublicView } from '../servers/qr-contact.service'

const ACTIVATED: QrTokenPublicView = {
	status: 'activated',
	ownerFirstName: 'Awa',
	label: 'Sac à dos noir',
	linkedObject: 'Sac',
}

type Action = (args: { request: Request }) => unknown

function renderPage(
	action: Action,
	token: QrTokenPublicView = ACTIVATED,
	loader = () => ({ token }),
) {
	const Stub = createRoutesStub([
		{
			path: '/q/:code',
			Component: QrContactPage,
			loader,
			action,
		},
	])

	render(<Stub initialEntries={['/q/ABC123']} />)
}

const ok = () => ({ success: true }) as ActionResult

// Every field is reached by its label, which is what proves each `<label>` is
// actually tied to its control.
const name = () => page.getByLabelText('Votre nom')
const phone = () => page.getByLabelText('Téléphone')
const email = () => page.getByLabelText(/^Email/)
const message = () => page.getByLabelText(/Où peut-il le récupérer/)
const addEmail = () =>
	page.getByRole('button', { name: 'Ajouter un email (facultatif)' })
const send = () => page.getByRole('button', { name: /Envoyer le message/ })

async function fillForm({ emailValue = '' }: { emailValue?: string } = {}) {
	await userEvent.fill(name(), 'Konan Yao')
	await userEvent.fill(phone(), '0700000000')
	if (emailValue) {
		await userEvent.click(addEmail())
		await userEvent.fill(email(), emailValue)
	}
	await userEvent.fill(message(), "J'ai trouvé votre sac au marché de Cocody.")
}

afterEach(() => {
	vi.restoreAllMocks()
})

describe('QrContactPage', () => {
	it('offers the form only for an activated sticker', async () => {
		renderPage(ok, { ...ACTIVATED, status: 'revoked' })

		await expect
			.element(page.getByText('Sticker désactivé'))
			.toBeInTheDocument()
		expect(
			page.getByRole('button', { name: /Envoyer le message/ }).elements(),
		).toHaveLength(0)
	})

	it('tells an un-activated sticker apart from a revoked one', async () => {
		renderPage(ok, { ...ACTIVATED, status: 'generated' })

		await expect
			.element(page.getByText('Sticker non activé'))
			.toBeInTheDocument()
	})

	it('greets the finder by the owner first name', async () => {
		renderPage(ok)

		await expect
			.element(page.getByRole('heading', { level: 1 }))
			.toHaveTextContent('Merci ! Cet objet appartient à Awa')
	})

	it('greets without a first name rather than leaving a gap', async () => {
		renderPage(ok, { ...ACTIVATED, ownerFirstName: null })

		await expect
			.element(page.getByText("Merci ! Cet objet appartient à quelqu'un"))
			.toBeInTheDocument()
	})

	it('names the sticker on its own card', async () => {
		renderPage(ok)

		await expect.element(page.getByText('Sur le sticker')).toBeInTheDocument()
		await expect.element(page.getByText('Sac à dos noir')).toBeInTheDocument()
	})

	it('draws no card when the owner named neither sticker nor object', async () => {
		renderPage(ok, { ...ACTIVATED, label: null, linkedObject: null })

		await expect.element(page.getByRole('heading', { level: 1 })).toBeVisible()
		expect(page.getByText('Sur le sticker').elements()).toHaveLength(0)
	})

	// The screen only ever sends a message, so the promise it makes is true.
	it('promises the owner number is never shown', async () => {
		renderPage(ok)

		await expect.element(page.getByText(/jamais montré/)).toBeInTheDocument()
	})

	it('makes no such promise on a sticker that cannot be contacted', async () => {
		renderPage(ok, { ...ACTIVATED, status: 'generated' })

		await expect
			.element(page.getByText('Sticker non activé'))
			.toBeInTheDocument()
		expect(page.getByText(/jamais montré/).elements()).toHaveLength(0)
	})

	it('reaches every field by its label', async () => {
		renderPage(ok)

		await expect.element(name()).toBeInTheDocument()
		await expect.element(phone()).toBeInTheDocument()
		await expect.element(message()).toBeInTheDocument()
	})

	it('keeps the email out of the way until it is asked for', async () => {
		renderPage(ok)

		await expect.element(addEmail()).toBeInTheDocument()
		expect(email().elements()).toHaveLength(0)

		await userEvent.click(addEmail())

		await expect.element(email()).toBeInTheDocument()
	})

	it('reports the schema messages on their own fields, without reaching the action', async () => {
		const action = vi.fn(ok)
		renderPage(action)

		await userEvent.click(send())

		await expect
			.element(page.getByText('Veuillez entrer votre nom complet'))
			.toBeInTheDocument()
		await expect
			.element(page.getByText(ASSIGNABLE_PHONE_ERROR_MESSAGE))
			.toBeInTheDocument()
		await expect
			.element(
				page.getByText('Votre message doit contenir au moins 5 caractères'),
			)
			.toBeInTheDocument()
		expect(action).not.toHaveBeenCalled()
	})

	it('rejects a malformed email client-side, and accepts a blank one', async () => {
		const action = vi.fn(ok)
		renderPage(action)

		await fillForm({ emailValue: 'pasunemail' })
		await userEvent.click(send())

		await expect
			.element(page.getByText('Veuillez entrer un email valide'))
			.toBeInTheDocument()
		expect(action).not.toHaveBeenCalled()

		await userEvent.clear(email())
		await userEvent.click(send())

		await expect.element(page.getByText('Message envoyé !')).toBeInTheDocument()
	})

	it('posts every field and shows the success screen', async () => {
		const received: Record<string, string> = {}
		renderPage(async ({ request }) => {
			for (const [key, value] of await request.formData()) {
				received[key] = String(value)
			}
			return ok()
		})

		await fillForm({ emailValue: 'konan@exemple.ci' })
		await userEvent.click(send())

		await vi.waitFor(() => expect(received.name).toBe('Konan Yao'))
		expect(received.phone).toBe('0700000000')
		expect(received.email).toBe('konan@exemple.ci')
		expect(received.message).toBe("J'ai trouvé votre sac au marché de Cocody.")

		await expect.element(page.getByText('Message envoyé !')).toBeInTheDocument()
		await expect
			.element(page.getByText(/Le propriétaire a été notifié/))
			.toBeInTheDocument()
	})

	it('renders a root error and keeps the form open', async () => {
		renderPage(
			() =>
				({
					success: false,
					errors: {
						root: { type: 'custom', message: 'Ce sticker a été désactivé' },
					},
				}) as ActionResult,
		)

		await fillForm()
		await userEvent.click(send())

		await expect
			.element(page.getByText("Impossible d'envoyer le message"))
			.toBeInTheDocument()
		await expect
			.element(page.getByText('Ce sticker a été désactivé'))
			.toBeInTheDocument()
		await expect.element(send()).toBeInTheDocument()
	})

	it('lands a server-side field error on its own field', async () => {
		renderPage(
			() =>
				({
					success: false,
					errors: {
						phone: { type: 'custom', message: 'Numéro refusé par l’opérateur' },
					},
				}) as ActionResult,
		)

		await fillForm()
		await userEvent.click(send())

		await expect
			.element(page.getByText('Numéro refusé par l’opérateur'))
			.toBeInTheDocument()
	})

	// A collapsed field would otherwise hide the message that belongs to it.
	it('reveals the collapsed email to carry its own server-side error', async () => {
		renderPage(
			() =>
				({
					success: false,
					errors: {
						email: { type: 'custom', message: 'Adresse refusée' },
					},
				}) as ActionResult,
		)

		await fillForm()
		await userEvent.click(send())

		await expect.element(email()).toBeInTheDocument()
		await expect.element(page.getByText('Adresse refusée')).toBeInTheDocument()
	})

	it('revalidates the loader after a successful send', async () => {
		const loader = vi.fn(() => ({ token: ACTIVATED }))
		renderPage(ok, ACTIVATED, loader)

		await vi.waitFor(() => expect(loader).toHaveBeenCalledTimes(1))

		await fillForm()
		await userEvent.click(send())

		await vi.waitFor(() => expect(loader).toHaveBeenCalledTimes(2))
	})
})
