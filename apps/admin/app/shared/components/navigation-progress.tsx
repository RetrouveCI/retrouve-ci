import { useEffect, useState } from 'react'
import { useNavigation } from 'react-router'
import { cn } from '@retrouve-ci/ui/utils'
import { useDashboard } from './dashboard-context'

/**
 * Thin top progress bar that animates while React Router resolves a
 * navigation (loaders/actions). Gives instant feedback on every route change
 * so the UI never feels frozen between click and render.
 */
export function NavigationProgress() {
	const navigation = useNavigation()
	const { collapsed } = useDashboard()
	const active = navigation.state !== 'idle'
	const [progress, setProgress] = useState(0)
	const [visible, setVisible] = useState(false)

	useEffect(() => {
		if (!active) return
		setVisible(true)
		setProgress(12)
		const id = setInterval(() => {
			setProgress(p => (p < 90 ? p + (90 - p) * 0.12 : p))
		}, 180)
		return () => clearInterval(id)
	}, [active])

	useEffect(() => {
		if (active) return
		setProgress(p => (p === 0 ? 0 : 100))
		const id = setTimeout(() => {
			setVisible(false)
			setProgress(0)
		}, 320)
		return () => clearTimeout(id)
	}, [active])

	if (!visible) return null

	return (
		<div
			className={cn(
				'fixed top-0 right-0 left-0 z-50 h-0.5 transition-[left] duration-200',
				collapsed ? 'lg:left-20' : 'lg:left-64',
			)}
		>
			<div
				className={cn(
					'bg-primary h-full transition-[width] duration-200 ease-out',
					progress === 100 && 'opacity-0 transition-opacity duration-300',
				)}
				style={{ width: `${progress}%` }}
			/>
		</div>
	)
}
