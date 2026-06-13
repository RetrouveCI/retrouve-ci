import { describe, expect, it } from 'vitest'
import { InvalidEventError } from '../errors/event.errors'
import type { CreateEventData, UpdateEventData } from '../types/event.types'
import { validateCreateEvent, validateUpdateEvent } from './event.validator'

const baseCreateData: CreateEventData = {
	title: 'Collecte des objets retrouvés',
	description: 'Une journée pour restituer les objets retrouvés',
	location: 'Place de la mairie',
	ville: 'Abidjan',
	eventDate: new Date('2026-02-01'),
}

describe('validateCreateEvent', () => {
	it('does not throw for valid data', () => {
		expect(() => validateCreateEvent(baseCreateData)).not.toThrow()
	})

	it('throws when description is too short', () => {
		expect(() =>
			validateCreateEvent({ ...baseCreateData, description: 'Court' }),
		).toThrow(InvalidEventError)
	})
})

describe('validateUpdateEvent', () => {
	it('does not throw for an empty update', () => {
		const data: UpdateEventData = {}

		expect(() => validateUpdateEvent(data)).not.toThrow()
	})

	it('throws when the updated description is too short', () => {
		expect(() => validateUpdateEvent({ description: 'Court' })).toThrow(
			InvalidEventError,
		)
	})
})
