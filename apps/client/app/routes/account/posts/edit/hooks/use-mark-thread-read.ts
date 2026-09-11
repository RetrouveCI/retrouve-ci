import { useEffect, useRef } from 'react'
import { useFetcher } from 'react-router'
import type { ListingComment } from '../../types/thread'

/** Opening the page reads what the team wrote, and the card's marker goes with it. */
export function useMarkThreadRead(
	listingId: string,
	thread: ListingComment[] | null,
) {
	const fetcher = useFetcher()
	const marked = useRef<string | null>(null)
	const hasUnread =
		thread?.some(
			comment => comment.authorSide === 'admin' && comment.readAt === null,
		) ?? false

	useEffect(() => {
		if (!hasUnread || marked.current === listingId) return

		marked.current = listingId
		void fetcher.submit(
			{ intent: 'read' },
			{ method: 'post', action: `/account/posts/${listingId}/comments` },
		)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [hasUnread, listingId])
}
