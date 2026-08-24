import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ContactMessageRepository } from '../../repository/contact-message.repository'
import type { CreateContactMessageData } from '../../types/contact-message.types'
import {
	buildContactMessage,
	buildRepository,
} from '../../__tests__/contact-message.fixture'
import { CreateContactMessageUseCase } from '../create-contact-message.use-case'

describe('CreateContactMessageUseCase', () => {
	let repository: ContactMessageRepository
	let useCase: CreateContactMessageUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new CreateContactMessageUseCase(repository)
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
})
