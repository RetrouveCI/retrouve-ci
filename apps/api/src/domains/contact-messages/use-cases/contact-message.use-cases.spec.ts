import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ContactMessageNotFoundError } from '../errors/contact-message.errors'
import type { ContactMessage } from '../models/contact-message.model'
import type { ContactMessageRepository } from '../repository/contact-message.repository'
import type { CreateContactMessageData } from '../types/contact-message.types'
import { ContactMessageUseCases } from './contact-message.use-cases'

function buildContactMessage(
	overrides: Partial<ContactMessage> = {},
): ContactMessage {
	return {
		id: 'message-1',
		name: 'Konan Yao',
		email: 'konan@example.ci',
		subject: 'Question sur un sticker',
		message: 'Bonjour, comment puis-je commander un sticker ?',
		status: 'new',
		createdAt: new Date('2026-01-01'),
		readAt: null,
		...overrides,
	}
}

function buildRepository(): ContactMessageRepository {
	return {
		create: vi.fn(),
		findById: vi.fn(),
		list: vi.fn(),
		updateStatus: vi.fn(),
	}
}

describe('ContactMessageUseCases', () => {
	let repository: ContactMessageRepository
	let useCases: ContactMessageUseCases

	beforeEach(() => {
		repository = buildRepository()
		useCases = new ContactMessageUseCases(repository)
	})

	describe('create', () => {
		const data: CreateContactMessageData = {
			name: 'Konan Yao',
			email: 'konan@example.ci',
			subject: 'Question sur un sticker',
			message: 'Bonjour, comment puis-je commander un sticker ?',
		}

		it('creates the contact message', async () => {
			const created = buildContactMessage()
			vi.mocked(repository.create).mockResolvedValue(created)

			const result = await useCases.create(data)

			expect(repository.create).toHaveBeenCalledWith(data)
			expect(result).toEqual(created)
		})
	})

	describe('getById', () => {
		it('returns the contact message when found', async () => {
			const message = buildContactMessage()
			vi.mocked(repository.findById).mockResolvedValue(message)

			expect(await useCases.getById('message-1')).toEqual(message)
		})

		it('throws when not found', async () => {
			vi.mocked(repository.findById).mockResolvedValue(null)

			await expect(useCases.getById('missing')).rejects.toThrow(
				ContactMessageNotFoundError,
			)
		})
	})

	describe('getOne', () => {
		it('marks a new message as read', async () => {
			const message = buildContactMessage({ status: 'new' })
			const updated = buildContactMessage({
				status: 'read',
				readAt: new Date('2026-01-02'),
			})
			vi.mocked(repository.findById).mockResolvedValue(message)
			vi.mocked(repository.updateStatus).mockResolvedValue(updated)

			const result = await useCases.getOne('message-1')

			expect(repository.updateStatus).toHaveBeenCalledWith(
				'message-1',
				'read',
			)
			expect(result).toEqual(updated)
		})

		it('does not change the status of an already read message', async () => {
			const message = buildContactMessage({ status: 'read' })
			vi.mocked(repository.findById).mockResolvedValue(message)

			const result = await useCases.getOne('message-1')

			expect(repository.updateStatus).not.toHaveBeenCalled()
			expect(result).toEqual(message)
		})
	})

	describe('list', () => {
		it('delegates to the repository', async () => {
			const response = {
				items: [buildContactMessage()],
				total: 1,
				page: 1,
				pageSize: 20,
			}
			vi.mocked(repository.list).mockResolvedValue(response)

			const result = await useCases.list({ page: 1, pageSize: 20 })

			expect(repository.list).toHaveBeenCalledWith({ page: 1, pageSize: 20 })
			expect(result).toEqual(response)
		})
	})

	describe('updateStatus', () => {
		it('updates the status after checking existence', async () => {
			const message = buildContactMessage({ status: 'new' })
			const archived = buildContactMessage({ status: 'archived' })
			vi.mocked(repository.findById).mockResolvedValue(message)
			vi.mocked(repository.updateStatus).mockResolvedValue(archived)

			const result = await useCases.updateStatus('message-1', 'archived')

			expect(repository.updateStatus).toHaveBeenCalledWith(
				'message-1',
				'archived',
			)
			expect(result).toEqual(archived)
		})

		it('throws when the message does not exist', async () => {
			vi.mocked(repository.findById).mockResolvedValue(null)

			await expect(
				useCases.updateStatus('missing', 'archived'),
			).rejects.toThrow(ContactMessageNotFoundError)
		})
	})
})
