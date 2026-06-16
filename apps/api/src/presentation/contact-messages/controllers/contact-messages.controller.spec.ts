import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ContactMessageUseCases } from '@/domains/contact-messages/use-cases/contact-message.use-cases'
import { ContactMessagesController } from './contact-messages.controller'

function buildUseCases(): ContactMessageUseCases {
	return {
		create: vi.fn(),
		getById: vi.fn(),
		getOne: vi.fn(),
		list: vi.fn(),
		updateStatus: vi.fn(),
	} as unknown as ContactMessageUseCases
}

describe('ContactMessagesController', () => {
	let useCases: ContactMessageUseCases
	let controller: ContactMessagesController

	beforeEach(() => {
		useCases = buildUseCases()
		controller = new ContactMessagesController(useCases)
	})

	describe('create', () => {
		it('is allowed anonymously', () => {
			expect(Reflect.getMetadata('PUBLIC', controller.create)).toBe(true)
		})

		it('delegates to create', async () => {
			const message = { id: 'message-1' }
			vi.mocked(useCases.create).mockResolvedValue(message as never)

			const dto = {
				name: 'Konan Yao',
				email: 'konan@example.ci',
				subject: 'Question sur un sticker',
				message: 'Bonjour, comment puis-je commander un sticker ?',
			}

			const result = await controller.create(dto)

			expect(useCases.create).toHaveBeenCalledWith(dto)
			expect(result).toEqual(message)
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

	describe('getOne', () => {
		it('is restricted to admins', () => {
			expect(Reflect.getMetadata('ROLES', controller.getOne)).toEqual(['admin'])
		})

		it('delegates to getOne', async () => {
			const message = { id: 'message-1', status: 'read' }
			vi.mocked(useCases.getOne).mockResolvedValue(message as never)

			const result = await controller.getOne('message-1')

			expect(useCases.getOne).toHaveBeenCalledWith('message-1')
			expect(result).toEqual(message)
		})
	})

	describe('updateStatus', () => {
		it('is restricted to admins', () => {
			expect(Reflect.getMetadata('ROLES', controller.updateStatus)).toEqual([
				'admin',
			])
		})

		it('delegates to updateStatus', async () => {
			const message = { id: 'message-1', status: 'archived' }
			vi.mocked(useCases.updateStatus).mockResolvedValue(message as never)

			const result = await controller.updateStatus('message-1', {
				status: 'archived',
			})

			expect(useCases.updateStatus).toHaveBeenCalledWith(
				'message-1',
				'archived',
			)
			expect(result).toEqual(message)
		})
	})
})
