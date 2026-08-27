import { createContext, useCallback, useContext, useState } from 'react'
import type { LayoutCounts } from '@/shared/types/dashboard'

interface DashboardContextValue {
	collapsed: boolean
	toggleSidebar: () => void
	counts: LayoutCounts
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export function DashboardProvider({
	initialCollapsed,
	counts,
	children,
}: {
	initialCollapsed: boolean
	counts: LayoutCounts
	children: React.ReactNode
}) {
	const [collapsed, setCollapsed] = useState(initialCollapsed)

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
