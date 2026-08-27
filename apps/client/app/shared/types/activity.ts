/**
 * The account summary behind the floating activity button.
 */
export interface ActivitySummary {
	posts: { total: number; active: number; pending: number }
	// Stickers/orders on stand-by until we have a reliable printer/logistics
	// partner — their routes are commented out of `routes.ts` too.
	// stickers: { total: number; activated: number }
	// orders: { total: number; inProgress: number }
	unreadNotifications: number
}
