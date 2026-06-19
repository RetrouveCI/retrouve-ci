import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react'
import { apiFetch } from '@/shared/lib/api-client'

/**
 * Live counters surfaced as badges across the dashboard shell (sidebar +
 * top bar). Only `notificationsUnread` is wired to a real endpoint today;
 * the shape is intentionally open so other counters (pending posts, new
 * contact messages…) can be added once their endpoints exist.
 */
export interface LayoutCounts {
	notificationsUnread: number
}

interface DashboardContextValue {
	collapsed: boolean
	toggleSidebar: () => void
	counts: LayoutCounts
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export function DashboardProvider({
	initialCollapsed,
	children,
}: {
	initialCollapsed: boolean
	children: React.ReactNode
}) {
	const [collapsed, setCollapsed] = useState(initialCollapsed)
	const [counts, setCounts] = useState<LayoutCounts>({
		notificationsUnread: 0,
	})

	useEffect(() => {
		apiFetch<{ count: number }>('/notifications/unread-count')
			.then(res =>
				setCounts(prev => ({ ...prev, notificationsUnread: res.count })),
			)
			.catch(() => {})
	}, [])

	const toggleSidebar = useCallback(() => {
		setCollapsed(prev => {
			const next = !prev
			document.cookie = `sidebar_collapsed=${next ? '1' : '0'}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`
			return next
		})
	}, [])

	return (
		<DashboardContext.Provider value={{ collapsed, toggleSidebar, counts }}>
			{children}
		</DashboardContext.Provider>
	)
}

export function useDashboard() {
	const ctx = useContext(DashboardContext)
	if (!ctx) {
		throw new Error('useDashboard must be used within a DashboardProvider')
	}
	return ctx
}
