import { EventNotFoundError } from '../errors/event.errors'
import type { EventRepository } from '../repository/event.repository'
import type { Event } from '../types/event.types'

/**
 * The existence guard three use-cases need. A use-case never calls another one,
 * so the check is named here rather than repeated three times.
 */
export async function requireEvent(
	repository: EventRepository,
	id: string,
): Promise<Event> {
	const event = await repository.findById(id)

	if (!event) {
		throw new EventNotFoundError(id)
	}

	return event
}
