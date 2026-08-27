/**
 * The account summary behind the floating activity button.
 */
export interface ActivitySummary {
	posts: { total: number; active: number; pending: number }
	stickers: { total: number; activated: number }
	orders: { total: number; inProgress: number }
	unreadNotifications: number
}
