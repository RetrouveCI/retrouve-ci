import { createContext, useCallback, useContext, useState } from 'react'

export type Theme = 'light' | 'dark'

interface ThemeContextValue {
	theme: Theme
	toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

/**
 * Holds the active theme, seeded from the SSR-resolved value (read from the
 * `theme` cookie in the root loader) so the first paint already matches — no
 * flash. Toggling updates the cookie and the `dark` class on <html> directly,
 * without a reload.
 */
export function ThemeProvider({
	initialTheme,
	children,
}: {
	initialTheme: Theme
	children: React.ReactNode
}) {
	const [theme, setTheme] = useState<Theme>(initialTheme)

	const toggleTheme = useCallback(() => {
		setTheme(prev => {
			const next: Theme = prev === 'dark' ? 'light' : 'dark'
			document.cookie = `theme=${next}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`
			document.documentElement.classList.toggle('dark', next === 'dark')
			return next
		})
	}, [])

	return (
		<ThemeContext.Provider value={{ theme, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	)
}

export function useTheme() {
	const ctx = useContext(ThemeContext)
	if (!ctx) {
		throw new Error('useTheme must be used within a ThemeProvider')
	}
	return ctx
}
