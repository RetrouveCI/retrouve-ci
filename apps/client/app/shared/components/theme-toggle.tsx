import { Moon, Sun } from 'lucide-react'
import { Button } from '@retrouve-ci/ui/components'
import { useTheme } from '@/shared/theme/theme-context'

export function ThemeToggle({ className }: { className?: string }) {
	const { theme, toggleTheme } = useTheme()
	const isDark = theme === 'dark'

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={toggleTheme}
			aria-label={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
			title={isDark ? 'Mode clair' : 'Mode sombre'}
			className={className ?? 'h-9 w-9 rounded-full'}
		>
			{isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
		</Button>
	)
}
