import { EventNotFoundError } from '../errors/event.errors'
import type { EventRepository } from '../repository/event.repository'
import type { Event } from '../types/event.types'
import { requireEvent } from './require-event'

// The rule the public list applied and the read by id did not: a `draft` event
// was readable by anyone holding its id. **Not found** rather than forbidden,
// as `requirePublishedLostItem` answers.
export async function requirePublishedEvent(
	repository: EventRepository,
	id: string,
): Promise<Event> {
	const event = await requireEvent(repository, id)

	if (event.status !== 'published') {
		throw new EventNotFoundError(id)
	}

	return event
}
