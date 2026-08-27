import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CreateContactMessageUseCase } from '@/domains/contact-messages/use-cases/create-contact-message.use-case'
import type { GetContactMessageUseCase } from '@/domains/contact-messages/use-cases/get-contact-message.use-case'
import type { GetPaginatedContactMessagesUseCase } from '@/domains/contact-messages/use-cases/get-paginated-contact-messages.use-case'
import type { UpdateContactMessageStatusUseCase } from '@/domains/contact-messages/use-cases/update-contact-message-status.use-case'
import { ContactMessagesController } from '../contact-messages.controller'

function buildUseCase<T>(): T {
	return { execute: vi.fn() } as unknown as T
}

describe('ContactMessagesController', () => {
	let createContactMessage: CreateContactMessageUseCase
	let getPaginated: GetPaginatedContactMessagesUseCase
	let getContactMessage: GetContactMessageUseCase
	let updateStatus: UpdateContactMessageStatusUseCase
	let controller: ContactMessagesController

	beforeEach(() => {
		createContactMessage = buildUseCase<CreateContactMessageUseCase>()
		getPaginated = buildUseCase<GetPaginatedContactMessagesUseCase>()
		getContactMessage = buildUseCase<GetContactMessageUseCase>()
		updateStatus = buildUseCase<UpdateContactMessageStatusUseCase>()
		controller = new ContactMessagesController(
			createContactMessage,
			getPaginated,
			getContactMessage,
			updateStatus,
		)
	})

	describe('create', () => {
		it('is allowed anonymously', () => {
			expect(Reflect.getMetadata('PUBLIC', controller.create)).toBe(true)
		})

		it('delegates to CreateContactMessageUseCase', async () => {
			const message = { id: 'message-1' }
			vi.mocked(createContactMessage.execute).mockResolvedValue(
				message as never,
			)

			const dto = {
				name: 'Konan Yao',
				email: 'konan@example.ci',
				subject: 'Question sur un sticker',
				message: 'Bonjour, comment puis-je commander un sticker ?',
			}

			const result = await controller.create(dto)

			expect(createContactMessage.execute).toHaveBeenCalledWith(dto)
			expect(result).toEqual(message)
		})
	})

	describe('list', () => {
		it('is restricted to admins', () => {
			expect(Reflect.getMetadata('ROLES', controller.list)).toEqual(['admin'])
		})

		it('delegates to GetPaginatedContactMessagesUseCase', async () => {
			const response = { items: [], total: 0, page: 1, pageSize: 20 }
			vi.mocked(getPaginated.execute).mockResolvedValue(response as never)

			const result = await controller.list({ page: 1, pageSize: 20 })

			expect(getPaginated.execute).toHaveBeenCalledWith({
				page: 1,
				pageSize: 20,
			})
			expect(result).toEqual(response)
		})
	})

	describe('getOne', () => {
		it('is restricted to admins', () => {
			expect(Reflect.getMetadata('ROLES', controller.getOne)).toEqual(['admin'])
		})

		it('delegates to GetContactMessageUseCase', async () => {
			const message = { id: 'message-1', status: 'read' }
			vi.mocked(getContactMessage.execute).mockResolvedValue(message as never)

			const result = await controller.getOne('message-1')

			expect(getContactMessage.execute).toHaveBeenCalledWith('message-1')
			expect(result).toEqual(message)
		})
	})

	describe('updateStatus', () => {
		it('is restricted to admins', () => {
			expect(Reflect.getMetadata('ROLES', controller.updateStatus)).toEqual([
				'admin',
			])
		})

		/**
		 * The id comes from the path and the status from the body, so the controller
		 * is what assembles the use-case's single input object.
		 */
		it('assembles the id and the status into one input', async () => {
			const message = { id: 'message-1', status: 'archived' }
			vi.mocked(updateStatus.execute).mockResolvedValue(message as never)

			const result = await controller.updateStatus('message-1', {
				status: 'archived',
			})

			expect(updateStatus.execute).toHaveBeenCalledWith({
				id: 'message-1',
				status: 'archived',
			})
			expect(result).toEqual(message)
		})
	})
})
