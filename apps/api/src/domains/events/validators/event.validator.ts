import { InvalidEventError } from '../errors/event.errors'
import { MIN_DESCRIPTION_LENGTH } from '../constants'
import type { CreateEventData, UpdateEventData } from '../types/event.types'

export function validateCreateEvent(data: CreateEventData): void {
	if (data.description.trim().length < MIN_DESCRIPTION_LENGTH) {
		throw new InvalidEventError(
			`La description doit contenir au moins ${MIN_DESCRIPTION_LENGTH} caractères`,
		)
	}
}

export function validateUpdateEvent(data: UpdateEventData): void {
	if (
		data.description !== undefined &&
		data.description.trim().length < MIN_DESCRIPTION_LENGTH
	) {
		throw new InvalidEventError(
			`La description doit contenir au moins ${MIN_DESCRIPTION_LENGTH} caractères`,
		)
	}
}
