import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'

/**
 * A selection belongs to what is on screen. The header box ticks the page and
 * not the base, so a selection that survived a filter or a page turn would act
 * on rows the operator can no longer see — and, on the orders list, would let
 * the next step be computed from a fraction of what it moves.
 *
 * The URL is what says the screen changed: it carries the page, the size, the
 * search and every filter.
 */
export function usePageSelection() {
	const { search } = useLocation()
	const [selected, setSelected] = useState<string[]>([])

	useEffect(() => {
		setSelected([])
	}, [search])

	return [selected, setSelected] as const
}
