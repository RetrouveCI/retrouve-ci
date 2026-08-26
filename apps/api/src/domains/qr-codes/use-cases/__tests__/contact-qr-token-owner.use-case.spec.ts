import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CreateContactMessageUseCase } from '@/domains/contact-messages/use-cases/create-contact-message.use-case'
import type { CreateNotificationUseCase } from '@/domains/notifications/use-cases/create-notification.use-case'
import { buildQrToken, buildRepository } from '../../__tests__/qr-token.fixture'
import {
	QrTokenNotActivatedError,
	QrTokenNotFoundError,
} from '../../errors/qr-token.errors'
import type { QrTokenRepository } from '../../repository/qr-token.repository'
import { ContactQrTokenOwnerUseCase } from '../contact-qr-token-owner.use-case'

const input = {
	code: 'RCI-ABC123',
	name: 'Konan',
	email: 'konan@example.com',
	phone: '+2250700000001',
	message: 'Bonjour, j’ai trouvé votre objet.',
}

function buildUseCase<TUseCase>(): TUseCase {
	return { execute: vi.fn() } as unknown as TUseCase
}

describe('ContactQrTokenOwnerUseCase', () => {
	let repository: QrTokenRepository
	let createContactMessage: CreateContactMessageUseCase
	let createNotification: CreateNotificationUseCase
	let useCase: ContactQrTokenOwnerUseCase

	beforeEach(() => {
		repository = buildRepository()
		createContactMessage = buildUseCase<CreateContactMessageUseCase>()
		createNotification = buildUseCase<CreateNotificationUseCase>()
		useCase = new ContactQrTokenOwnerUseCase(
			repository,
			createContactMessage,
			createNotification,
		)
	})

	it('writes a message and a notification addressed to the owner', async () => {
		vi.mocked(repository.findByCode).mockResolvedValue(
			buildQrToken({
				status: 'activated',
				userId: 'owner-1',
				label: 'Mes clés',
			}),
		)

		await useCase.execute(input)

		expect(createContactMessage.execute).toHaveBeenCalledWith({
			name: 'Konan',
			email: 'konan@example.com',
			phone: '+2250700000001',
			subject: 'Sticker QR — Mes clés',
			message: 'Bonjour, j’ai trouvé votre objet.',
			qrTokenCode: 'RCI-ABC123',
			recipientUserId: 'owner-1',
		})
		expect(createNotification.execute).toHaveBeenCalledWith({
			type: 'qr_scan',
			title: "Quelqu'un a trouvé votre objet",
			message: 'Konan vous a contacté via votre sticker QR.',
			link: '/account/stickers',
			userId: 'owner-1',
		})
	})

	// An unlabelled sticker is identified by its code in the subject line.
	it('falls back to the code when the token carries no label', async () => {
		vi.mocked(repository.findByCode).mockResolvedValue(
			buildQrToken({ status: 'activated', userId: 'owner-1', label: null }),
		)

		await useCase.execute(input)

		expect(createContactMessage.execute).toHaveBeenCalledWith(
			expect.objectContaining({ subject: 'Sticker QR — RCI-ABC123' }),
		)
	})

	it.each(['generated', 'revoked'] as const)(
		'refuses a %s token, writing nothing',
		async status => {
			vi.mocked(repository.findByCode).mockResolvedValue(
				buildQrToken({ status, userId: 'owner-1' }),
			)

			await expect(useCase.execute(input)).rejects.toThrow(
				QrTokenNotActivatedError,
			)
			expect(createContactMessage.execute).not.toHaveBeenCalled()
			expect(createNotification.execute).not.toHaveBeenCalled()
		},
	)

	// `userId` is nullable, and a message with no recipient would be unreachable.
	it('refuses an activated token with no owner', async () => {
		vi.mocked(repository.findByCode).mockResolvedValue(
			buildQrToken({ status: 'activated', userId: null }),
		)

		await expect(useCase.execute(input)).rejects.toThrow(
			QrTokenNotActivatedError,
		)
		expect(createContactMessage.execute).not.toHaveBeenCalled()
		expect(createNotification.execute).not.toHaveBeenCalled()
	})

	it('answers not found for an unknown code', async () => {
		vi.mocked(repository.findByCode).mockResolvedValue(null)

		await expect(useCase.execute(input)).rejects.toThrow(QrTokenNotFoundError)
		expect(createContactMessage.execute).not.toHaveBeenCalled()
	})

	/**
	 * The visitor is anonymous and reads `message` straight from the filter, so
	 * the refusal must stay the French sentence the controller used to throw.
	 */
	it('keeps the refusal in French', () => {
		expect(new QrTokenNotActivatedError().message).toBe(
			"Ce sticker n'est pas encore activé",
		)
	})
})
