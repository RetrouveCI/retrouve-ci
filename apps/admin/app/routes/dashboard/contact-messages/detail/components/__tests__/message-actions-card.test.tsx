import { createRoutesStub } from 'react-router'
import { page, render, userEvent } from '@/shared/helpers/testing'
import type { ActionResult } from '@/shared/types/action'
import type { ContactMessage } from '../../../types/contact-messages.types'
import { MessageActionsCard } from '../message-actions-card'

function buildMessage(overrides: Partial<ContactMessage> = {}): ContactMessage {
	return {
		id: 'msg-1',
		name: 'Konan Aya',
		email: null,
		phone: null,
		subject: 'Activation de sticker',
		message: 'Bonjour, je n’arrive pas à activer mon sticker.',
		status: 'read',
		qrTokenCode: null,
		createdAt: '2026-09-09T08:12:00.000Z',
		...overrides,
	} as ContactMessage
}

function renderCard(
	message: ContactMessage,
	action: (args: { request: Request }) => Promise<ActionResult> = async () =>
		({ success: true }) as ActionResult,
) {
	const Stub = createRoutesStub([
		{
			path: '/contact-messages/:id',
			Component: () => <MessageActionsCard message={message} />,
			action,
		},
	])

	render(<Stub initialEntries={[`/contact-messages/${message.id}`]} />)
}

describe('MessageActionsCard', () => {
	it('replies on WhatsApp to a reachable number', async () => {
		renderCard(buildMessage({ phone: '0712668307' }))

		await expect
			.element(page.getByRole('link', { name: 'Répondre sur WhatsApp' }))
			.toHaveAttribute('href', 'https://wa.me/2250712668307')
	})

	it('replies by e-mail, carrying the subject', async () => {
		renderCard(buildMessage({ email: 'aya@exemple.ci' }))

		await expect
			.element(page.getByRole('link', { name: 'Répondre par e-mail' }))
			.toHaveAttribute(
				'href',
				`mailto:aya@exemple.ci?subject=${encodeURIComponent('Re: Activation de sticker')}`,
			)
	})

	it('says when there is nobody to answer', async () => {
		renderCard(buildMessage())

		await expect
			.element(page.getByText(/ni numéro joignable ni e-mail/))
			.toBeVisible()
	})

	it('archives the message through the list’s action', async () => {
		const sent: Record<string, unknown>[] = []
		renderCard(buildMessage(), async ({ request }) => {
			sent.push(Object.fromEntries(await request.formData()))
			return { success: true } as ActionResult
		})

		await userEvent.click(page.getByRole('button', { name: 'Archiver' }))

		await vi.waitFor(() =>
			expect(sent).toEqual([{ intent: 'archive', id: 'msg-1' }]),
		)
	})

	it('offers no archiving once archived', async () => {
		renderCard(buildMessage({ status: 'archived', email: 'aya@exemple.ci' }))

		await expect
			.element(page.getByRole('link', { name: 'Répondre par e-mail' }))
			.toBeVisible()
		expect(
			page.getByRole('button', { name: 'Archiver' }).elements(),
		).toHaveLength(0)
	})
})
