import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CreateNotificationUseCase } from '@/domains/notifications/use-cases/create-notification.use-case'
import {
	buildOwnerReach,
	buildRepository,
} from '../../__tests__/qr-token.fixture'
import {
	QrTokenDirectContactRefusedError,
	QrTokenNotActivatedError,
	QrTokenOwnerUnreachableError,
} from '../../errors/qr-token.errors'
import type { QrTokenRepository } from '../../repository/qr-token.repository'
import { ReachQrTokenOwnerUseCase } from '../reach-qr-token-owner.use-case'

describe('ReachQrTokenOwnerUseCase', () => {
	let repository: QrTokenRepository
	let createNotification: CreateNotificationUseCase
	let useCase: ReachQrTokenOwnerUseCase

	beforeEach(() => {
		repository = buildRepository()
		createNotification = {
			execute: vi.fn().mockResolvedValue({ id: 'notification-1' }),
		} as unknown as CreateNotificationUseCase
		useCase = new ReachQrTokenOwnerUseCase(repository, createNotification)
	})

	const reach = (channel: 'call' | 'whatsapp' = 'call') =>
		useCase.execute({ code: 'RCI-ABC123', channel })

	it('answers a dialer URL for a consented call', async () => {
		vi.mocked(repository.findOwnerReach).mockResolvedValue(buildOwnerReach())

		await expect(reach('call')).resolves.toEqual({ url: 'tel:+2250700000000' })
	})

	it('prefills the WhatsApp message with the sticker label and the code', async () => {
		vi.mocked(repository.findOwnerReach).mockResolvedValue(buildOwnerReach())

		const { url } = await reach('whatsapp')

		expect(url).toContain('https://wa.me/2250700000000?text=')
		expect(decodeURIComponent(url)).toContain('« Mes clés »')
		expect(decodeURIComponent(url)).toContain('RCI-ABC123')
	})

	it('names the object generically when the sticker was never labelled', async () => {
		vi.mocked(repository.findOwnerReach).mockResolvedValue(
			buildOwnerReach({ label: null }),
		)

		const { url } = await reach('whatsapp')

		expect(decodeURIComponent(url)).toContain('votre objet')
	})

	it('tells the owner someone is calling, and says which way', async () => {
		vi.mocked(repository.findOwnerReach).mockResolvedValue(buildOwnerReach())

		await reach('whatsapp')

		expect(createNotification.execute).toHaveBeenCalledWith({
			type: 'qr_scan',
			title: "Quelqu'un cherche à vous joindre",
			message:
				'Une personne a scanné le sticker de « Mes clés » et vous écrit sur WhatsApp.',
			link: '/account/stickers',
			userId: 'owner-1',
		})
	})

	// The jump is what the finder came for; the trace must not be able to stop it.
	it('still answers the URL when the notification fails', async () => {
		vi.mocked(repository.findOwnerReach).mockResolvedValue(buildOwnerReach())
		vi.mocked(createNotification.execute).mockRejectedValue(new Error('down'))

		await expect(reach()).resolves.toEqual({ url: 'tel:+2250700000000' })
	})

	it('refuses a sticker whose owner did not consent', async () => {
		vi.mocked(repository.findOwnerReach).mockResolvedValue(
			buildOwnerReach({ directContact: false }),
		)

		await expect(reach()).rejects.toBeInstanceOf(
			QrTokenDirectContactRefusedError,
		)
		expect(createNotification.execute).not.toHaveBeenCalled()
	})

	// One answer for all four: telling them apart would say which codes exist.
	it.each([
		['an unknown code', null],
		['a token still generated', buildOwnerReach({ status: 'generated' })],
		['a revoked token', buildOwnerReach({ status: 'revoked' })],
		['a token with no owner', buildOwnerReach({ ownerUserId: null })],
	])('refuses %s the same way', async (_label, stored) => {
		vi.mocked(repository.findOwnerReach).mockResolvedValue(stored)

		await expect(reach()).rejects.toBeInstanceOf(QrTokenNotActivatedError)
	})

	it.each([null, '070000000'])(
		'refuses to build a jump on the unusable number %o',
		async stored => {
			vi.mocked(repository.findOwnerReach).mockResolvedValue(
				buildOwnerReach({ ownerPhoneNumber: stored }),
			)

			await expect(reach()).rejects.toBeInstanceOf(QrTokenOwnerUnreachableError)
			expect(createNotification.execute).not.toHaveBeenCalled()
		},
	)
})
