import { useEffect } from 'react'
import { useFetcher } from 'react-router'
import type { ActivityLoaderData } from '@/routes/account/servers/activity.loader'

interface ActivitySummaryResult {
	summary: ActivityLoaderData['summary']
	isLoading: boolean
	/** Called when the panel opens, so an open always shows current numbers. */
	refresh: () => void
}

/**
 * Loads the account summary through the `account/activity` resource route. The
 * first load is what lights the button's dot, so it runs as soon as the visitor
 * is known to be signed in — once per full page load, not once per navigation.
 */
export function useActivitySummary(enabled: boolean): ActivitySummaryResult {
	const fetcher = useFetcher<ActivityLoaderData>()

	const refresh = () => fetcher.load('/account/activity')

	useEffect(() => {
		if (!enabled) return
		fetcher.load('/account/activity')
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [enabled])

	return {
		summary: fetcher.data?.summary ?? null,
		// `idle` with no data yet means the first load has not been issued.
		isLoading: fetcher.state === 'loading',
		refresh,
	}
}
