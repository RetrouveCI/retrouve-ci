import { ContactMessageNotFoundError } from '../errors/contact-message.errors'
import type { ContactMessageRepository } from '../repository/contact-message.repository'
import type { ContactMessage } from '../types/contact-message.types'

/**
 * The existence guard two use-cases need. It lives here rather than in a
 * use-case of its own because a use-case must never call another one, and
 * repeating the same three lines twice is worse than naming them once.
 */
export async function requireContactMessage(
	repository: ContactMessageRepository,
	id: string,
): Promise<ContactMessage> {
	const contactMessage = await repository.findById(id)

	if (!contactMessage) {
		throw new ContactMessageNotFoundError(id)
	}

	return contactMessage
}
