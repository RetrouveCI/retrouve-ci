export const NOTIFICATION_TYPES = [
	'match_found',
	'qr_scan',
	'stickers_delivered',
	'listing_pending',
	'listing_moderated',
	'listing_contacted',
	'order_placed',
	'contact_received',
	'order_processing',
	'order_shipped',
	'order_cancelled',
] as const

/**
 * Who a notification speaks to. An `admin` row carries no owner: it addresses
 * the desk, so the first administrator who reads it reads it for all.
 */
export const NOTIFICATION_AUDIENCES = ['user', 'admin'] as const

// The three that address the desk. Declared as a partition of the types — the
// spec asserts it — so a type added above falls on one side or the other rather
// than reaching a visitor's bell by omission.
export const ADMIN_NOTIFICATION_TYPES = [
	'listing_pending',
	'order_placed',
	'contact_received',
] as const

export const USER_NOTIFICATION_TYPES = [
	'match_found',
	'qr_scan',
	'stickers_delivered',
	'listing_moderated',
	'listing_contacted',
	'order_processing',
	'order_shipped',
	'order_cancelled',
] as const
