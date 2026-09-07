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
	directContact: false,
	lostItem: null,
}

type Action = (args: { request: Request }) => unknown

function renderPage(
	action: Action,
	token: QrTokenPublicView = ACTIVATED,
	loader = () => ({ token, reach: null }),
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
		const loader = vi.fn(() => ({ token: ACTIVATED, reach: null }))
		renderPage(ok, ACTIVATED, loader)

		await vi.waitFor(() => expect(loader).toHaveBeenCalledTimes(1))

		await fillForm()
		await userEvent.click(send())

		await vi.waitFor(() => expect(loader).toHaveBeenCalledTimes(2))
	})
})

const CONSENTED: QrTokenPublicView = { ...ACTIVATED, directContact: true }

const whatsapp = () =>
	page.getByRole('button', { name: /Prévenir Awa sur WhatsApp/ })
const callOwner = () => page.getByRole('button', { name: 'Appeler' })

/** A8: the buttons exist only where the owner said yes, and the note follows. */
describe('QrContactPage — reaching the owner directly', () => {
	it('draws no jump at all without consent', async () => {
		renderPage(ok, ACTIVATED)

		await expect.element(page.getByLabelText('Votre nom')).toBeInTheDocument()
		expect(whatsapp().query()).toBeNull()
		expect(callOwner().query()).toBeNull()
	})

	it("keeps the mockup's promise, word for word, without consent", async () => {
		renderPage(ok, ACTIVATED)

		await expect
			.element(
				page.getByText('Le numéro du propriétaire ne vous est jamais montré.'),
			)
			.toBeVisible()
	})

	it('draws both jumps with consent, WhatsApp first', async () => {
		renderPage(ok, CONSENTED)

		await expect.element(whatsapp()).toBeVisible()
		await expect.element(callOwner()).toBeVisible()
	})

	// On the markup rather than on a click: `reloadDocument` makes these real
	// document submissions, which is the whole point.
	it.each([
		['whatsapp', /Prévenir Awa sur WhatsApp/],
		['call', /^Appeler$/],
	])('posts the %s channel to the resource route', async (channel, label) => {
		renderPage(ok, CONSENTED)

		const button = page.getByRole('button', { name: label })
		await expect.element(button).toBeVisible()
		const form = button.element().closest('form')

		expect(form?.getAttribute('action')).toBe('/q/ABC123/reach')
		expect(form?.getAttribute('method')).toBe('post')
		expect(
			form?.querySelector('input[name="channel"]')?.getAttribute('value'),
		).toBe(channel)
	})

	// With consent the mockup's sentence is simply false, and §2 forbids that.
	it('says the number will show once consent was given', async () => {
		renderPage(ok, CONSENTED)

		await expect
			.element(
				page.getByText(
					/Awa accepte d'être joint directement — son numéro s'affichera/,
				),
			)
			.toBeVisible()
	})

	it.each([
		['failed', /Le contact direct n'a pas pu être établi/],
		['throttled', /Trop de tentatives depuis votre connexion/],
	])(
		'reports a %s jump on the screen it sent them back to',
		async (reach, message) => {
			renderPage(ok, CONSENTED, () => ({ token: CONSENTED, reach }) as never)

			await expect.element(page.getByRole('alert')).toHaveTextContent(message)
		},
	)
})

/** A9: the sticker says the object is being looked for, and opens the listing. */
describe('QrContactPage — a sticker linked to a listing', () => {
	const LINKED: QrTokenPublicView = {
		...ACTIVATED,
		lostItem: {
			id: 'lost-item-9',
			title: 'Trousseau de clés',
			ville: 'Abidjan',
			photo: null,
		},
	}

	const card = () => page.getByRole('link', { name: /Déclaré perdu/ })

	it('draws nothing when no listing came back', async () => {
		renderPage(ok, ACTIVATED)

		await expect.element(page.getByLabelText('Votre nom')).toBeInTheDocument()
		expect(card().query()).toBeNull()
	})

	it('names the listing and opens it', async () => {
		renderPage(ok, LINKED, () => ({ token: LINKED, reach: null }))

		await expect.element(card()).toBeVisible()
		await expect.element(card()).toHaveAttribute('href', '/posts/lost-item-9')
		await expect.element(page.getByText('Trousseau de clés')).toBeVisible()
	})

	// The page decides nothing: the API sends a listing only when it is showable.
	it('shows the photo the API sent, and a placeholder without one', async () => {
		const withPhoto: QrTokenPublicView = {
			...LINKED,
			lostItem: { ...LINKED.lostItem!, photo: 'https://cdn/keys.jpg' },
		}
		renderPage(ok, withPhoto, () => ({ token: withPhoto, reach: null }))

		await expect.element(card()).toBeVisible()
		expect(card().element().querySelector('img')?.getAttribute('src')).toBe(
			'https://cdn/keys.jpg',
		)
	})
})
