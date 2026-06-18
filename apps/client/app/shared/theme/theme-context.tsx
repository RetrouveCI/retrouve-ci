import {
	createContext,
	useCallback,
	useContext,
	useState,
	type ReactNode,
} from 'react'
import { THEME_COOKIE, type Theme } from './theme'

interface ThemeContextValue {
	theme: Theme
	toggleTheme: () => void
	setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({
	initialTheme,
	children,
}: {
	initialTheme: Theme
	children: ReactNode
}) {
	const [theme, setThemeState] = useState<Theme>(initialTheme)

	const setTheme = useCallback((next: Theme) => {
		setThemeState(next)
		if (typeof document !== 'undefined') {
			document.documentElement.classList.toggle('dark', next === 'dark')
			document.documentElement.style.colorScheme = next
			document.cookie = `${THEME_COOKIE}=${next};path=/;max-age=31536000;samesite=lax`
		}
	}, [])

	const toggleTheme = useCallback(() => {
		setTheme(theme === 'dark' ? 'light' : 'dark')
	}, [theme, setTheme])

	return (
		<ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
			{children}
		</ThemeContext.Provider>
	)
}

export function useTheme() {
	const context = useContext(ThemeContext)
	if (context === undefined) {
		throw new Error('useTheme must be used within a ThemeProvider')
	}
	return context
}
