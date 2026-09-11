import { useEffect } from 'react'
import { useFetcher } from 'react-router'
import type { loader } from '../servers/post-thread.loader'
import type { PostComment } from '../types/posts.types'

/**
 * `undefined` while loading, `null` when the API refused. An action on the page
 * revalidates the fetcher, so a comment just sent appears without a reload.
 */
export function usePostThread(
	postId: string,
): PostComment[] | null | undefined {
	const fetcher = useFetcher<typeof loader>()

	useEffect(() => {
		fetcher.load(`/posts/${postId}/comments`)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [postId])

	// A thread still answering for the previous listing is not this one's.
	return fetcher.data?.postId === postId ? fetcher.data.comments : undefined
}
