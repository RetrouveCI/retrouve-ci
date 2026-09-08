import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ContactMessageRepository } from '../../repository/contact-message.repository'
import type { CreateContactMessageData } from '../../types/contact-message.types'
import {
	buildContactMessage,
	buildRepository,
} from '../../__tests__/contact-message.fixture'
import { CreateNotificationUseCase } from '@/domains/notifications/use-cases/create-notification.use-case'
import { CreateContactMessageUseCase } from '../create-contact-message.use-case'
function buildNotifier(): CreateNotificationUseCase {
	return {
		execute: vi.fn().mockResolvedValue(undefined),
	} as unknown as CreateNotificationUseCase
}

describe('CreateContactMessageUseCase', () => {
	let repository: ContactMessageRepository
	let useCase: CreateContactMessageUseCase
	let notifier: CreateNotificationUseCase

	beforeEach(() => {
		repository = buildRepository()
		notifier = buildNotifier()
		useCase = new CreateContactMessageUseCase(repository, notifier)
	})

	const data: CreateContactMessageData = {
		name: 'Konan Yao',
		email: 'konan@example.ci',
		subject: 'Question sur un sticker',
		message: 'Bonjour, comment puis-je commander un sticker ?',
	}

	it('creates the contact message', async () => {
		const created = buildContactMessage()
		vi.mocked(repository.create).mockResolvedValue(created)

		const result = await useCase.execute(data)

		expect(repository.create).toHaveBeenCalledWith(data)
		expect(result).toEqual(created)
	})

	// The QR-scan entry point posts a phone and names the sticker's owner,
	// where the web form posts an email.
	it('passes a QR-scan payload through untouched', async () => {
		const created = buildContactMessage({
			email: null,
			phone: '+2250700000000',
			qrTokenCode: 'ABC123',
			recipientUserId: 'user-1',
		})
		vi.mocked(repository.create).mockResolvedValue(created)

		const payload: CreateContactMessageData = {
			name: 'Awa',
			subject: 'Sticker QR — ABC123',
			message: "J'ai trouvé votre objet",
			phone: '+2250700000000',
			qrTokenCode: 'ABC123',
			recipientUserId: 'user-1',
		}

		expect(await useCase.execute(payload)).toEqual(created)
		expect(repository.create).toHaveBeenCalledWith(payload)
	})

	describe('telling the desk', () => {
		beforeEach(() => {
			vi.mocked(repository.create).mockResolvedValue(buildContactMessage())
		})

		it('raises a desk notification naming the sender', async () => {
			await useCase.execute(data)

			const [call] = vi.mocked(notifier.execute).mock.calls

			expect(call?.[0]).toMatchObject({
				type: 'contact_received',
				link: '/contact-messages?status=new',
			})
		})

		it('still records the message when the notice fails', async () => {
			vi.mocked(notifier.execute).mockRejectedValue(new Error('redis down'))

			await expect(useCase.execute(data)).resolves.toBeDefined()
		})
	})
})
