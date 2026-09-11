import { useEffect, useRef } from 'react'
import { useFetcher } from 'react-router'
import type { PostComment } from '../types/posts.types'

/** Opening a thread reads the poster's replies, and the list's marker goes with them. */
export function useMarkThreadRead(
	postId: string,
	comments: PostComment[] | null | undefined,
) {
	const fetcher = useFetcher()
	const marked = useRef<string | null>(null)
	const hasUnread =
		comments?.some(
			comment => comment.authorSide === 'owner' && comment.readAt === null,
		) ?? false

	useEffect(() => {
		if (!hasUnread || marked.current === postId) return

		marked.current = postId
		fetcher.submit(
			{ intent: 'read' },
			{ method: 'post', action: `/posts/${postId}/comments` },
		)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [hasUnread, postId])
}
