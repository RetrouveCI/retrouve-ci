import { useEffect, useState } from 'react'

/**
 * Answers `false` on the server and through hydration, so a caller that gates
 * rendering on it ships nothing in the SSR payload — `HeroMap` alone drew 897
 * circles into every home page for a column no phone displays.
 */
export function useMediaQuery(query: string) {
	const [matches, setMatches] = useState(false)

	useEffect(() => {
		const list = window.matchMedia(query)
		const onChange = () => setMatches(list.matches)
		onChange()
		list.addEventListener('change', onChange)
		return () => list.removeEventListener('change', onChange)
	}, [query])

	return matches
}
