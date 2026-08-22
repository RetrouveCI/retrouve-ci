import { describe, expect, it, vi } from 'vitest'
import {
	buildContactMessage,
	buildRepository,
} from '../../__tests__/contact-message.fixture'
import { ContactMessageNotFoundError } from '../../errors/contact-message.errors'
import { requireContactMessage } from '../require-contact-message'

describe('requireContactMessage', () => {
	it('returns the message when it exists', async () => {
		const repository = buildRepository()
		const message = buildContactMessage()
		vi.mocked(repository.findById).mockResolvedValue(message)

		expect(await requireContactMessage(repository, 'message-1')).toEqual(
			message,
		)
	})

	// This is the guard two use-cases share instead of calling each other.
	it('throws a domain error naming the id', async () => {
		const repository = buildRepository()
		vi.mocked(repository.findById).mockResolvedValue(null)

		await expect(requireContactMessage(repository, 'missing')).rejects.toThrow(
			ContactMessageNotFoundError,
		)
	})
})
