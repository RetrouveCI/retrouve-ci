/**
 * Live counters surfaced as badges across the dashboard shell (sidebar + top
 * bar). Only `notificationsUnread` is wired to a real endpoint today; the shape
 * is intentionally open so other counters (pending posts, new contact
 * messages…) can be added once their endpoints exist.
 */
export interface LayoutCounts {
	notificationsUnread: number
}
