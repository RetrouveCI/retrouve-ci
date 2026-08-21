import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ContactMessageUseCases } from '@/domains/contact-messages/use-cases/contact-message.use-cases'
import type { NotificationUseCases } from '@/domains/notifications/use-cases/notification.use-cases'
import type { QrTokenUseCases } from '@/domains/qr-codes/use-cases/qr-token.use-cases'
import { QrCodesController } from './qr-codes.controller'

function buildUseCases(): QrTokenUseCases {
	return {
		generateBatch: vi.fn(),
		getByCode: vi.fn(),
		getPublicView: vi.fn(),
		activate: vi.fn(),
		revoke: vi.fn(),
		updateDetails: vi.fn(),
		list: vi.fn(),
		listMine: vi.fn(),
	} as unknown as QrTokenUseCases
}

function buildContactMessageUseCases(): ContactMessageUseCases {
	return { create: vi.fn() } as unknown as ContactMessageUseCases
}

function buildNotificationUseCases(): NotificationUseCases {
	return { create: vi.fn() } as unknown as NotificationUseCases
}

const session = { user: { id: 'user-1' } } as Parameters<
	QrCodesController['listMine']
>[0]

describe('QrCodesController', () => {
	let useCases: QrTokenUseCases
	let controller: QrCodesController

	beforeEach(() => {
		useCases = buildUseCases()
		controller = new QrCodesController(
			useCases,
			buildContactMessageUseCases(),
			buildNotificationUseCases(),
		)
	})

	describe('generate', () => {
		it('is restricted to admins', () => {
			expect(Reflect.getMetadata('ROLES', controller.generate)).toEqual([
				'admin',
			])
		})

		it('delegates to generateBatch', async () => {
			const tokens = [{ code: 'RCI-ABC123' }]
			vi.mocked(useCases.generateBatch).mockResolvedValue(tokens as never)

			const result = await controller.generate({ count: 1, batch: 'batch-1' })

			expect(useCases.generateBatch).toHaveBeenCalledWith({
				count: 1,
				batch: 'batch-1',
			})
			expect(result).toEqual(tokens)
		})
	})

	describe('list', () => {
		it('is restricted to admins', () => {
			expect(Reflect.getMetadata('ROLES', controller.list)).toEqual(['admin'])
		})

		it('delegates to list', async () => {
			const response = { items: [], total: 0, page: 1, pageSize: 20 }
			vi.mocked(useCases.list).mockResolvedValue(response as never)

			const result = await controller.list({ page: 1, pageSize: 20 })

			expect(useCases.list).toHaveBeenCalledWith({ page: 1, pageSize: 20 })
			expect(result).toEqual(response)
		})
	})

	describe('listMine', () => {
		it('delegates to listMine with the session user id', async () => {
			const response = { items: [], total: 0, page: 1, pageSize: 20 }
			vi.mocked(useCases.listMine).mockResolvedValue(response as never)

			const result = await controller.listMine(session, {
				page: 1,
				pageSize: 20,
			})

			expect(useCases.listMine).toHaveBeenCalledWith('user-1', {
				page: 1,
				pageSize: 20,
			})
			expect(result).toEqual(response)
		})
	})

	describe('getOne', () => {
		it('delegates to getByCode', async () => {
			const qrToken = { code: 'RCI-ABC123' }
			vi.mocked(useCases.getByCode).mockResolvedValue(qrToken as never)

			const result = await controller.getOne('RCI-ABC123')

			expect(useCases.getByCode).toHaveBeenCalledWith('RCI-ABC123')
			expect(result).toEqual(qrToken)
		})
	})

	describe('activate', () => {
		it('delegates to activate with the session user id', async () => {
			const qrToken = { code: 'RCI-ABC123', status: 'activated' }
			vi.mocked(useCases.activate).mockResolvedValue(qrToken as never)

			const result = await controller.activate(session, 'RCI-ABC123', {
				label: 'Mes clés',
			})

			expect(useCases.activate).toHaveBeenCalledWith('RCI-ABC123', 'user-1', {
				label: 'Mes clés',
			})
			expect(result).toEqual(qrToken)
		})
	})

	describe('revoke', () => {
		it('delegates to revoke with the session user id', async () => {
			const qrToken = { code: 'RCI-ABC123', status: 'revoked' }
			vi.mocked(useCases.revoke).mockResolvedValue(qrToken as never)

			const result = await controller.revoke(session, 'RCI-ABC123')

			expect(useCases.revoke).toHaveBeenCalledWith('RCI-ABC123', 'user-1')
			expect(result).toEqual(qrToken)
		})
	})

	describe('update', () => {
		it('delegates to updateDetails with the session user id', async () => {
			const qrToken = { code: 'RCI-ABC123', label: 'Mes clés' }
			vi.mocked(useCases.updateDetails).mockResolvedValue(qrToken as never)

			const result = await controller.update(session, 'RCI-ABC123', {
				label: 'Mes clés',
			})

			expect(useCases.updateDetails).toHaveBeenCalledWith(
				'RCI-ABC123',
				'user-1',
				{ label: 'Mes clés' },
			)
			expect(result).toEqual(qrToken)
		})
	})
})
