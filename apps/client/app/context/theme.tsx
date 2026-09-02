import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
	type ReactNode,
} from 'react'
import {
	THEME_COLOR,
	themeCookie,
	type Theme,
	type ThemePreference,
} from '@/shared/helpers/theme'

interface ThemeContextValue {
	/** What is painted right now — `system` already resolved. */
	theme: Theme
	/** What the visitor chose, which is what the settings screen shows. */
	preference: ThemePreference
	setTheme: (preference: ThemePreference) => void
	toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const DARK_QUERY = '(prefers-color-scheme: dark)'

export const resolveTheme = (
	preference: ThemePreference,
	deviceIsDark: boolean,
): Theme =>
	preference === 'system' ? (deviceIsDark ? 'dark' : 'light') : preference

function apply(theme: Theme, preference: ThemePreference) {
	const root = document.documentElement
	root.classList.toggle('dark', theme === 'dark')
	/**
	 * `light dark` rather than the resolved value, so the browser keeps painting
	 * scrollbars and native controls from the device setting as it changes.
	 */
	root.style.colorScheme = preference === 'system' ? 'light dark' : theme
	// A `media` attribute could not follow a switch: it reads the device.
	document
		.querySelector('meta[name="theme-color"]')
		?.setAttribute('content', THEME_COLOR[theme])
}

export function ThemeProvider({
	initialPreference,
	children,
}: {
	initialPreference: ThemePreference
	children: ReactNode
}) {
	const [preference, setPreference] =
		useState<ThemePreference>(initialPreference)
	/**
	 * Seeded from the preference alone, never from `matchMedia`: the server has no
	 * media query, so reading one here would make the first client render disagree
	 * with the HTML. The effect below corrects it after hydration, and the inline
	 * script in `root.tsx` has already painted the right thing meanwhile.
	 */
	const [deviceIsDark, setDeviceIsDark] = useState(false)

	useEffect(() => {
		const query = window.matchMedia(DARK_QUERY)
		const sync = () => setDeviceIsDark(query.matches)

		sync()
		query.addEventListener('change', sync)
		return () => query.removeEventListener('change', sync)
	}, [])

	const theme = resolveTheme(preference, deviceIsDark)

	// The device may change while `system` is selected, with nothing clicked.
	useEffect(() => {
		apply(theme, preference)
	}, [theme, preference])

	const setTheme = useCallback((next: ThemePreference) => {
		setPreference(next)
		document.cookie = themeCookie(next)
	}, [])

	/**
	 * The header toggle stays a two-state control: from `system` it commits to the
	 * opposite of what is currently on screen, which is what someone clicking a
	 * sun or a moon is asking for.
	 */
	const toggleTheme = useCallback(() => {
		setTheme(theme === 'dark' ? 'light' : 'dark')
	}, [theme, setTheme])

	return (
		<ThemeContext.Provider value={{ theme, preference, setTheme, toggleTheme }}>
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
