import { useEffect, useState } from 'react'

/**
 * Answers `true` through the server render and hydration, so a page never
 * flashes an offline banner it would immediately take back. `navigator.onLine`
 * only knows whether an interface is up, which is why it is read for a banner
 * and never to decide whether a request is worth making.
 */
export function useOnlineStatus(): boolean {
	const [online, setOnline] = useState(true)

	useEffect(() => {
		const sync = () => setOnline(navigator.onLine)
		sync()

		window.addEventListener('online', sync)
		window.addEventListener('offline', sync)

		return () => {
			window.removeEventListener('online', sync)
			window.removeEventListener('offline', sync)
		}
	}, [])

	return online
}
