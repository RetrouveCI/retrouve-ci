export const CONTACT_MESSAGE_STATUSES = ['new', 'read', 'archived'] as const

/** `new` is set on creation and never chosen by a caller. */
export const CONTACT_MESSAGE_UPDATABLE_STATUSES = ['read', 'archived'] as const
