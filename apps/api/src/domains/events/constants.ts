import type { EventStatus } from './types/event.types'

export const EVENT_STATUSES: EventStatus[] = ['draft', 'published', 'cancelled']

export const MIN_DESCRIPTION_LENGTH = 10
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 50
