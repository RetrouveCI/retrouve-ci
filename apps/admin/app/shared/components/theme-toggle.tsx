import { Button } from '@retrouve-ci/ui/components'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from './theme-context'

export function ThemeToggle() {
	const { theme, toggleTheme } = useTheme()
	const isDark = theme === 'dark'

	return (
		<Button
			variant="ghost"
			size="icon"
			className="rounded-lg"
			onClick={toggleTheme}
			aria-label={isDark ? 'Activer le thème clair' : 'Activer le thème sombre'}
		>
			{isDark ? <Sun size={18} /> : <Moon size={18} />}
		</Button>
	)
}
